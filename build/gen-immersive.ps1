$ErrorActionPreference='Stop'
$root='C:\Users\user\Desktop\david'
$enc=[Text.UTF8Encoding]::new($false)
$idx=Join-Path $root 'index.html'
$html=[IO.File]::ReadAllText($idx,$enc)

# ---- image-first project cards ----
$imgs=@{
 'וילה משפחתית'='1600585154340-be6161a56a0c';
 'בית עם בריכה'='1512917774080-9991f1c4c750';
 'הסדרת חריגות'='1503387762-592deb58ef4e';
 'משק חקלאי'='1500382017468-9049fed747ef';
 'תכנון פנים'='1618221195710-dd6b41faaea6';
 'בית עסק ורישוי'='1497366216548-37526070297c'
}
foreach($k in $imgs.Keys){
  $city=switch($k){
    'וילה משפחתית'{'כפר סבא'}; 'בית עם בריכה'{'רעננה'}; 'הסדרת חריגות'{'תל אביב'};
    'משק חקלאי'{'עמק חפר'}; 'תכנון פנים'{'הרצליה'}; 'בית עסק ורישוי'{'נתניה'}
  }
  $old='<a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>'+$k+'</h4><span class="city">'+$city+'</span></div></a>'
  $src='https://images.unsplash.com/photo-'+$imgs[$k]+'?q=80&w=900&auto=format&fit=crop'
  $new='<a class="proj-card" href="project.html" data-tilt="4"><div class="ph"><img src="'+$src+'" alt="'+$k+' — '+$city+'" loading="lazy"><div class="cap"><h4>'+$k+'</h4><span class="city">'+$city+'</span></div></div></a>'
  $html=$html.Replace($old,$new)
}

# ---- statement band before projects ----
$statement=@'
<!-- ================= STATEMENT ================= -->
<section class="statement">
  <div class="wrap">
    <div class="big" data-parallax="0.05">מתכננים. <span class="bronze">פותרים.</span> מבצעים.</div>
  </div>
</section>

'@
$anchor='<!-- ================= PROJECTS ================= -->'
$html=$html.Replace($anchor, $statement+$anchor)

[IO.File]::WriteAllText($idx,$html,$enc)
Write-Host "index.html updated"

# ---- wire motion.js into every page (before main.js) ----
$n=0
Get-ChildItem $root -Filter *.html | ForEach-Object {
  $c=[IO.File]::ReadAllText($_.FullName,$enc)
  if($c -notmatch 'assets/motion\.js'){
    $c=$c.Replace('<script src="assets/main.js"></script>','<script src="assets/motion.js"></script>'+"`n"+'<script src="assets/main.js"></script>')
    [IO.File]::WriteAllText($_.FullName,$c,$enc); $n++
  }
}
Write-Host "wired motion.js into $n files"
