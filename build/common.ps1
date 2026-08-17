# Shared chrome + helpers for page generators. Dot-source this.
$script:HEADER = @'
<a class="skip-link" href="#main">דלג לתוכן הראשי</a>
<a class="whatsapp-btn" href="https://wa.me/972503851111" target="_blank" rel="noopener" aria-label="פנייה בוואטסאפ">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17.6 6.3A8.9 8.9 0 0 0 3.2 16.8L2 22l5.3-1.4A8.9 8.9 0 0 0 21 12a8.9 8.9 0 0 0-3.4-5.7ZM12 20a7.9 7.9 0 0 1-4-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A7.9 7.9 0 1 1 12 20Z" fill="#EEE7D6"/><path d="M9 7.6c.2 0 .4 0 .5.3l.8 1.9c.1.2 0 .4-.1.5l-.5.6c-.1.2-.1.3 0 .5.4.7 1.5 1.9 2.6 2.3.2.1.3 0 .5-.1l.6-.6c.1-.1.3-.2.5-.1l1.8.9c.2.1.3.3.3.5 0 .8-.7 1.6-1.5 1.6-2.6 0-5.6-3-5.6-5.7 0-.9.8-1.6 1.1-1.6Z" fill="#1B1D16"/></svg>
</a>
<header id="site-header">
  <div class="wrap nav">
    <a class="logo" href="index.html" aria-label="David Balaish Architecture — לעמוד הבית"><img src="assets/logo.jpg" alt="David Balaish Architecture"></a>
    <ul class="nav-links">
      <li><a href="index.html" data-page="index.html">בית</a></li>
      <li><a href="about.html" data-page="about.html">אודות</a></li>
      <li class="has-mega">
        <a href="services.html" data-page="services.html">שירותים</a>
        <div class="mega">
          <a href="service-homes.html">בתים פרטיים <span aria-hidden="true">&#8594;</span></a>
          <a href="service-interior.html">עיצוב ותכנון פנים <span aria-hidden="true">&#8594;</span></a>
          <a href="service-permits.html">היתרי בנייה והסדרת חריגות <span aria-hidden="true">&#8594;</span></a>
          <a href="service-pools.html">בריכות שחייה <span aria-hidden="true">&#8594;</span></a>
          <a href="service-business.html">רישוי עסקים <span aria-hidden="true">&#8594;</span></a>
          <a href="service-farms.html">משקים ונחלות <span aria-hidden="true">&#8594;</span></a>
        </div>
      </li>
      <li><a href="projects.html" data-page="projects.html">פרויקטים</a></li>
      <li><a href="contact.html" data-page="contact.html">יצירת קשר</a></li>
    </ul>
    <div class="nav-cta">
      <a class="phone" href="tel:0503851111">050-385-1111</a>
      <a class="btn btn-solid" href="contact.html">לתיאום פגישה</a>
      <button class="burger" id="burgerBtn" aria-label="פתיחת תפריט" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" aria-hidden="true">
  <button class="drawer-close" id="drawerClose" aria-label="סגירת תפריט">&times;</button>
  <a href="index.html">בית</a>
  <a href="about.html">אודות</a>
  <a href="services.html">שירותים</a>
  <a href="projects.html">פרויקטים</a>
  <a href="contact.html">יצירת קשר</a>
  <a href="tel:0503851111" style="color:#C9A876">050-385-1111</a>
</div>
'@

$script:FOOTER = @'
<footer>
  <div class="wrap">
    <div class="foot-top">
      <div>
        <div class="foot-logo"><img src="assets/logo.jpg" alt="David Balaish Architecture"></div>
        <p style="max-width:32ch; font-size:14px;">משרד אדריכלות המלווה תכנון, היתרים ומעטפת מקצועית מלאה בכל רחבי הארץ.</p>
      </div>
      <div>
        <h5>ניווט</h5>
        <ul>
          <li><a href="about.html">אודות</a></li>
          <li><a href="services.html">שירותים</a></li>
          <li><a href="projects.html">פרויקטים</a></li>
          <li><a href="contact.html">יצירת קשר</a></li>
        </ul>
      </div>
      <div>
        <h5>שירותים</h5>
        <ul>
          <li><a href="service-homes.html">בתים פרטיים</a></li>
          <li><a href="service-permits.html">היתרי בנייה</a></li>
          <li><a href="service-pools.html">בריכות שחייה</a></li>
          <li><a href="service-business.html">רישוי עסקים</a></li>
        </ul>
      </div>
      <div>
        <h5>יצירת קשר</h5>
        <ul>
          <li><a href="tel:0503851111">050-385-1111</a></li>
          <li><a href="mailto:kfiryonani@icloud.com">kfiryonani@icloud.com</a></li>
          <li><a href="https://instagram.com/david_balaish" target="_blank" rel="noopener">אינסטגרם</a></li>
          <li><a href="https://facebook.com/davidbalaishh" target="_blank" rel="noopener">פייסבוק</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>&copy; <span data-year>2026</span> David Balaish Architecture. כל הזכויות שמורות.</span>
      <span class="legal">
        <a href="privacy.html">מדיניות פרטיות</a>
        <a href="accessibility.html">הצהרת נגישות</a>
        <a href="terms.html">תנאי שימוש</a>
      </span>
    </div>
  </div>
</footer>
<script src="assets/main.js"></script>
</body>
</html>
'@

function Head-Block($title, $desc, $slug) {
@"
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$title | David Balaish Architecture</title>
<meta name="description" content="$desc">
<link rel="canonical" href="https://davidbalaish.co.il/$slug">
<meta name="theme-color" content="#1B1D16">
<meta property="og:type" content="website">
<meta property="og:site_name" content="David Balaish Architecture">
<meta property="og:title" content="$title | David Balaish Architecture">
<meta property="og:description" content="$desc">
<meta property="og:locale" content="he_IL">
<meta property="og:image" content="assets/logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&family=Assistant:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="assets/logo.jpg">
<link rel="stylesheet" href="assets/styles.css">
<noscript><style>.reveal{opacity:1!important;translate:none!important}</style></noscript>
</head>
<body>
"@
}

function Get-Contact($headingKey, $headingHtml, $projectRef) {
@"
<section class="contact on-dark" id="contact">
  <div class="wrap contact-grid">
    <div class="contact-info reveal">
      <p class="eyebrow">יצירת קשר</p>
      <h2 style="margin-top:20px;" data-contact-heading="$headingKey">$headingHtml</h2>
      <p>מלאו את הפרטים ונחזור אליכם בהקדם לתיאום שיחת היכרות ראשונית, ללא התחייבות.</p>
      <div class="contact-detail">
        <a href="tel:0503851111">050-385-1111</a>
        <a href="mailto:kfiryonani@icloud.com">kfiryonani@icloud.com</a>
        <a href="https://instagram.com/david_balaish" target="_blank" rel="noopener">אינסטגרם — david_balaish@</a>
        <a href="https://facebook.com/davidbalaishh" target="_blank" rel="noopener">פייסבוק — davidbalaishh</a>
      </div>
    </div>
    <form class="lead-form reveal" novalidate data-project="$projectRef">
      <input type="text" name="company_url" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="field-row">
        <div class="field"><label for="f-name">שם מלא <span class="req">*</span></label><input id="f-name" type="text" name="name" required autocomplete="name"><span class="err-msg">נא להזין שם מלא</span></div>
        <div class="field"><label for="f-phone">טלפון <span class="req">*</span></label><input id="f-phone" type="tel" name="phone" required autocomplete="tel"><span class="err-msg">נא להזין מספר טלפון</span></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="f-email">דוא&quot;ל <span class="req">*</span></label><input id="f-email" type="email" name="email" required autocomplete="email"><span class="err-msg">נא להזין כתובת דוא&quot;ל תקינה</span></div>
        <div class="field"><label for="f-city">עיר / יישוב</label><input id="f-city" type="text" name="city" autocomplete="address-level2"></div>
      </div>
      <div class="field">
        <label for="f-service">סוג השירות</label>
        <select id="f-service" name="service">
          <option>בתים פרטיים</option><option>עיצוב ותכנון פנים</option><option>היתרי בנייה והסדרת חריגות</option>
          <option>בריכות שחייה</option><option>רישוי עסקים</option><option>משקים ונחלות</option><option>אחר</option>
        </select>
      </div>
      <div class="field"><label for="f-msg">תיאור קצר של הצורך</label><textarea id="f-msg" name="message" rows="3"></textarea></div>
      <div class="field"><label for="f-file">צירוף מסמך או תמונה (אופציונלי)</label><input id="f-file" type="file" name="attachment"></div>
      <label class="consent"><input type="checkbox" name="consent" required><span>אני מאשר/ת קבלת פנייה חוזרת ומסכים/ה <a href="privacy.html">למדיניות הפרטיות</a>. <span class="req">*</span></span></label>
      <button type="submit" class="btn btn-bronze" style="width:100%; justify-content:center;">שליחת פנייה</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
"@
}

function Save-Page($slug, $head, $body) {
  $page = $head + $script:HEADER + $body + $script:FOOTER
  $out = Join-Path 'C:\Users\user\Desktop\david' $slug
  [IO.File]::WriteAllText($out, $page, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "wrote $out"
}
