# Minimal static file server for previewing the site locally.
# Plain TCP + hand-rolled HTTP/1.1 (no HttpListener) to avoid Windows URL-ACL restrictions.
$root = 'C:\Users\Callisto\Desktop\Projects\david'
$port = 5500

function Get-Mime($ext) {
  switch ($ext.ToLower()) {
    '.html' { 'text/html; charset=utf-8' }
    '.htm'  { 'text/html; charset=utf-8' }
    '.css'  { 'text/css; charset=utf-8' }
    '.js'   { 'application/javascript; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.png'  { 'image/png' }
    '.svg'  { 'image/svg+xml' }
    '.gif'  { 'image/gif' }
    '.webp' { 'image/webp' }
    '.mp4'  { 'video/mp4' }
    '.ico'  { 'image/x-icon' }
    default { 'application/octet-stream' }
  }
}

function Handle-Client($client) {
  try {
    $client.ReceiveTimeout = 5000
    $client.SendTimeout = 5000
    $stream = $client.GetStream()
    $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII)
    $requestLine = $reader.ReadLine()
    while (($line = $reader.ReadLine()) -and $line.Trim() -ne '') {} # drain headers
    if (-not $requestLine) { return }

    $parts = $requestLine.Split(' ')
    $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
    $path = [Uri]::UnescapeDataString($rawPath.Split('?')[0])
    if ($path -eq '/') { $path = '/index.html' }
    $filePath = Join-Path $root ($path.TrimStart('/').Replace('/', '\'))
    $rootFull = [IO.Path]::GetFullPath($root)

    $bytes = $null; $status = '200 OK'; $mime = 'text/plain'
    try { $fullPath = [IO.Path]::GetFullPath($filePath) } catch { $fullPath = '' }

    if ($fullPath -and $fullPath.StartsWith($rootFull) -and (Test-Path $fullPath -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($fullPath)
      $mime = Get-Mime ([IO.Path]::GetExtension($fullPath))
    } elseif ($fullPath -and -not $fullPath.StartsWith($rootFull)) {
      $status = '403 Forbidden'; $bytes = [Text.Encoding]::UTF8.GetBytes('403 Forbidden')
    } else {
      $status = '404 Not Found'; $bytes = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
    }

    $header = "HTTP/1.1 $status`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache, no-store`r`nConnection: close`r`n`r`n"
    $hb = [Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($hb, 0, $hb.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
  } catch {
  } finally {
    $client.Close()
  }
}

$listener = New-Object System.Net.Sockets.TcpListener ([Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "Serving $root at http://localhost:$port/"
while ($true) {
  $client = $listener.AcceptTcpClient()
  Handle-Client $client
}
