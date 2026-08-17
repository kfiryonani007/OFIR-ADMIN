# Generates the 6 service pages from one shared template + per-service data.
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\user\Desktop\david'

# ---------- shared chrome ----------
$HEADER = @'
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

$FOOTER = @'
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

function Get-Contact($headingKey, $headingHtml) {
@"
<section class="contact on-dark">
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
    <form class="lead-form reveal" novalidate data-project="">
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

$PROCESS = @'
<section class="wrap-section on-dark">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">תהליך העבודה</p><h2>איך אנחנו מתקדמים יחד</h2></div>
    <div class="timeline reveal">
      <div class="t-row"><div class="n">01</div><div><h4>שיחת היכרות והבנת הצורך</h4><p>מבינים מה המצב הקיים, מהו החזון ומהם האילוצים.</p></div></div>
      <div class="t-row"><div class="n">02</div><div><h4>בדיקת הנכס והמסמכים</h4><p>איסוף היתרים, תכניות ותב&quot;ע רלוונטיים.</p></div></div>
      <div class="t-row"><div class="n">03</div><div><h4>בדיקת היתכנות תכנונית</h4><p>מיפוי מה ניתן וכדאי לבצע, לפני כל התחייבות.</p></div></div>
      <div class="t-row"><div class="n">04</div><div><h4>תכנית פעולה והצעת מחיר</h4><p>לוחות זמנים, שלבים ועלויות בצורה שקופה.</p></div></div>
      <div class="t-row"><div class="n">05</div><div><h4>תכנון, תיאום יועצים והגשה</h4><p>פיתוח החלופה, עבודה מול היועצים והגשת הבקשה.</p></div></div>
      <div class="t-row"><div class="n">06</div><div><h4>ליווי עד להשלמת התהליך</h4><p>מלווים אתכם עד לקבלת האישורים ותחילת הביצוע.</p></div></div>
    </div>
  </div>
</section>
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
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Service","serviceType":"$title","provider":{"@type":"ProfessionalService","name":"David Balaish Architecture","telephone":"+972-50-385-1111"},"areaServed":"IL","description":"$desc"}
</script>
</head>
<body>
"@
}

# ---------- per-service data ----------
$services = @(
  @{ slug='service-homes'; title='בתים פרטיים'; hkey='homes';
     heading='מתכננים לבנות בית? בואו נתחיל בבדיקת המגרש והצרכים.';
     lead='הבית שלכם מתחיל הרבה לפני שמתחילים לבנות — בבדיקת הזכויות, הבנת המגרש ותכנון שמתאים לחיים שלכם.';
     img='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop';
     intro=@('תכנון בית פרטי הוא הרבה מעבר לחזית יפה. הוא מתחיל בהבנה מדויקת של זכויות הבנייה, תנאי השטח והפרוגרמה המשפחתית — ורק אז עובר לתכנון החללים והחזיתות.','המשרד מלווה אתכם מהשלב הראשון ועד לתכניות העבודה וההיתר, כשכל בעלי המקצוע מרוכזים תחת גורם אחד.');
     topics=@(
        @('זכויות בנייה','בדיקת מה מותר לבנות במגרש לפי התב&quot;ע והתקנון.'),
        @('תנאי שטח ופרוגרמה','התאמת התכנון לטופוגרפיה, לכיווני האוויר ולצרכים המשפחתיים.'),
        @('תכנון חללים וחזיתות','חלוקה פנימית נכונה ושפה אדריכלית עקבית.'),
        @('חוץ, חצר ובריכה','ראייה כוללת של הבית והסביבה שלו.'),
        @('היתר ותיאום יועצים','ריכוז מודד, מהנדס ויועצים עד לקבלת ההיתר.'),
        @('תכניות עבודה וליווי ביצוע','ליווי מקצועי גם בשלב הבנייה בפועל.'));
     benefits=@(
        @('01','ראייה כוללת','תכנון שמחבר בין הבית, המגרש והסביבה — לא רק חזית בודדת.'),
        @('02','גורם אחד','ריכוז כל בעלי המקצוע תחת ניהול אחד, בלי שתצטרכו לתאם לבד.'),
        @('03','שקיפות','לוחות זמנים, שלבים ועלויות ברורים מראש.'));
     advisors=$true; note=$null;
     faqs=@(
        @('כמה זמן לוקח לתכנן בית פרטי?','משך התכנון תלוי במורכבות המגרש ובהיקף הפרויקט, ונקבע בבירור בשלב תכנית הפעולה.'),
        @('האם בודקים זכויות בנייה לפני שמתחילים?','כן. בדיקת זכויות והיתכנות תכנונית היא שלב פתיחה קבוע, עוד לפני כל התחייבות.'),
        @('מי מנהל את היועצים בפרויקט?','המשרד מתכלל את המודד, המהנדס והיועצים הנוספים — אתם מול כתובת אחת.'));
     story=@('משפחת לוי','כפר סבא','מרעיון על מגרש ריק לבית משפחתי מאושר','המצב: מגרש חדש ללא תכנון קודם. הפעולה: בדיקת זכויות, פרוגרמה ותכנון חלופה. התוצאה: תכנית עבודה מלאה שהוגשה לוועדה.','"קיבלנו ליווי צמוד לאורך כל הדרך, עם תשובות ברורות בכל שלב."') },

  @{ slug='service-interior'; title='עיצוב ותכנון פנים'; hkey='';
     heading='רוצים חלל שמתאים לחיים שלכם? בואו נתכנן אותו נכון.';
     lead='עיצוב טוב לא מתחיל בבחירת צבעים — אלא בהבנת החיים בתוך החלל, ורק אז בפרטים.';
     img='https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop';
     intro=@('תכנון פנים מתחיל בשאלה איך אתם באמת חיים בבית — ורק אחר כך עובר לחלוקת חללים, לחומרים ולתאורה.','אנחנו מתרגמים את השגרה שלכם לתכנית ביצוע מדויקת, כולל תיאום מול ספקים ונגרים.');
     topics=@(
        @('חלוקת חללים','ארגון מחדש של החלל כך שיתאים לשגרה האמיתית.'),
        @('מטבח, רחצה ואחסון','תכנון פונקציונלי של האזורים הנעשים בהם שימוש יומיומי.'),
        @('נגרות ופתרונות מותאמים','אחסון ורהיטים מתוכננים לפי המידות והצרכים.'),
        @('חומרים ותאורה','בחירת גימורים ותכנון תאורה שמשרתים את החלל.'),
        @('תכניות ביצוע','תכניות מדויקות שמאפשרות ביצוע נקי באתר.'),
        @('תיאום ספקים','ליווי מול נותני השירות עד להשלמת העבודה.'));
     benefits=@(
        @('01','מתחילים מהחיים','הבנת השגרה שלכם לפני כל החלטת עיצוב.'),
        @('02','פונקציה ואסתטיקה','חלל שנעים לחיות בו ולא רק להסתכל עליו.'),
        @('03','ביצוע מסודר','תכניות מדויקות ותיאום ספקים לאורך הדרך.'));
     advisors=$false; note=$null;
     faqs=@(
        @('האם אפשר לתכנן פנים גם לבית קיים?','כן. תכנון פנים מתאים גם לשיפוץ והתאמה של בית קיים, לא רק לבנייה חדשה.'),
        @('מה כוללות תכניות הביצוע?','חלוקת חללים, פירוט נגרות, חומרים ותאורה — ברמת פירוט שמאפשרת ביצוע מדויק.'),
        @('האם אתם מתאמים מול הספקים?','כן, אנחנו מלווים את התיאום מול נותני השירות עד להשלמת העבודה.'));
     story=@('משפחת אברהם','הרצליה','תכנון פנים שהתאים את הבית לשגרה של המשפחה','המצב: חלוקה שלא התאימה לצרכים. הפעולה: תכנון מחדש של החללים והנגרות. התוצאה: בית מסודר ופונקציונלי.','"פתאום כל פינה בבית עובדת בשבילנו."') },

  @{ slug='service-permits'; title='היתרי בנייה והסדרת חריגות'; hkey='';
     heading='נדרשים להיתר או להסדרת חריגה? בואו נבחן את המצב.';
     lead='מהמצב הקיים בשטח — לתכנון חוקי, מסודר ומאושר, בהתאם לנסיבות ולהחלטות הרשויות.';
     img='https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop';
     intro=@('בין אם מדובר בהיתר חדש, בתוספת בנייה או בהסדרת חריגה קיימת — התהליך מתחיל בהבנת המצב התכנוני ובבדיקת ההתאמה לתב&quot;ע ולהיתר.','המשרד בונה תכנית פעולה מסודרת ומלווה את הבקשה מול הוועדה, כשהמטרה היא הסדרה מקצועית התלויה בנסיבות המקרה.');
     topics=@(
        @('היתר חדש ותוספות','ליווי בקשות להיתר בנייה חדש, תוספות והרחבות.'),
        @('שינויי חזית וסגירת מרפסות','התאמת שינויים קיימים לדרישות התכנון.'),
        @('פרגולות ומבני עזר','הסדרה ותכנון של אלמנטים בחצר ובמעטפת.'),
        @('בחינת חריגות','מיפוי הפער בין הבנוי בפועל להיתר ולתב&quot;ע.'),
        @('התאמה לתב&quot;ע','בניית תכנית שמתיישבת עם הוראות התכנון.'),
        @('עבודה מול הוועדה','הגשה וליווי הבקשה מול רשויות התכנון.'));
     benefits=@(
        @('01','תמונה מלאה','הבנה מדויקת של המצב התכנוני לפני כל צעד.'),
        @('02','תכנית פעולה','מסלול מסודר להסדרה, בהתאם לנסיבות ולרשויות.'),
        @('03','ליווי מול הרשות','נוכחות מקצועית לאורך הטיפול בבקשה.'));
     advisors=$false;
     note=@('חשוב לדעת','הסדרת חריגות היא מטרה מקצועית התלויה בנסיבות המקרה ובהחלטות הרשויות המוסמכות. המשרד אינו מתחייב לתוצאה משפטית מסוימת, ופועל לבניית תכנית הסדרה מיטבית בהתאם למצב הספציפי ולדרישות הוועדה.');
     faqs=@(
        @('האם אפשר להסדיר בנייה שבוצעה ללא היתר?','בחינת המצב הקיים והתאמתו להוראות התב&quot;ע וההיתר היא חלק מרכזי מהעבודה, בכפוף לנסיבות ולהחלטות הרשויות.'),
        @('כמה זמן נמשך תהליך היתר?','הזמן משתנה לפי סוג הבקשה, מורכבות הנכס והרשות — ונקבע בבירור בשלב תכנית הפעולה.'),
        @('מה בודקים בשלב הראשון?','את המצב התכנוני, ההיתרים הקיימים והתאמת הבנוי בפועל לתב&quot;ע.'));
     story=@('משפחת כהן','תל אביב','מחריגת בנייה להסדרה מלאה מול הרשות','המצב: התראה על בנייה שבוצעה ללא היתר. הפעולה: בדיקת התכניות והוראות התב&quot;ע ובניית תכנית הסדרה. התוצאה: התאמת המצב הקיים לדרישות הוועדה.','"ליווי צמוד וברור, מהרגע הראשון ועד לסגירת התיק מול הרשות."') },

  @{ slug='service-pools'; title='בריכות שחייה'; hkey='pools';
     heading='רוצים לבדוק האם ניתן לקבל היתר לבריכה בנכס שלכם?';
     lead='מהרעיון בחצר — לבריכה מתוכננת ומאושרת, שמתחילה בבדיקת היתכנות מקדימה.';
     img='https://images.unsplash.com/photo-1572331165267-854da2b010cc?q=80&w=1000&auto=format&fit=crop';
     intro=@('תכנון בריכת שחייה מתחיל בבדיקת היתכנות — קווי בניין, הוראות התב&quot;ע והעמדה נכונה במגרש.','לצד התכנון האדריכלי, אנחנו מרכזים את יועצי הבטיחות, הקונסטרוקציה והאינסטלציה עד לקבלת ההיתר.');
     topics=@(
        @('בדיקת היתכנות','בחינה מקדימה האם ניתן לתכנן בריכה במגרש.'),
        @('קווי בניין ותב&quot;ע','התאמת ההעמדה להוראות התכנון החלות.'),
        @('העמדה בחצר','מיקום הבריכה ביחס לבית ולסביבה.'),
        @('בטיחות, קונסטרוקציה ואינסטלציה','ריכוז היועצים הנדרשים לבריכה תקינה ובטוחה.'),
        @('גידור ובטיחות','תכנון בהתאם לדרישות הבטיחות.'),
        @('היתר בנייה','ליווי הבקשה מול הרשות עד לאישור.'));
     benefits=@(
        @('01','מתחילים מהיתכנות','בדיקה מקדימה לפני כל התחייבות.'),
        @('02','מעטפת יועצים','ריכוז בטיחות, קונסטרוקציה ואינסטלציה תחת גורם אחד.'),
        @('03','מסלול מוגדר','תהליך ברור עד לקבלת ההיתר.'));
     advisors=$true;
     note=@('מסלול ההתחייבות','בכפוף לבדיקת היתכנות מקדימה ואישור התאמת המגרש להוראות התכנון, המשרד מציע מסלול התחייבות להפקת היתר לבריכת השחייה, בהתאם לתנאים שיוגדרו בהסכם ההתקשרות.');
     faqs=@(
        @('האם לכל מגרש אפשר לאשר בריכה?','לא בהכרח. היכולת תלויה בקווי הבניין, בהוראות התב&quot;ע ובהתאמת המגרש — ולכן מתחילים בבדיקת היתכנות מקדימה.'),
        @('מה כולל מסלול ההתחייבות?','בכפוף לבדיקת היתכנות ואישור התאמת המגרש, המשרד מציע מסלול התחייבות להפקת היתר, בהתאם לתנאים שבהסכם ההתקשרות.'),
        @('אילו יועצים נדרשים לבריכה?','בדרך כלל יועצי בטיחות, קונסטרוקציה ואינסטלציה — כולם מרוכזים על ידי המשרד.'));
     story=@('משפחת מזרחי','רעננה','מבדיקת היתכנות לבריכה מאושרת בחצר','המצב: רצון להוסיף בריכה בחצר קיימת. הפעולה: בדיקת היתכנות, העמדה ותיאום יועצים. התוצאה: בקשה שהוגשה בהתאם להוראות התכנון.','"קיבלנו תשובה כנה כבר בהתחלה, וזה מה שאִפשר לנו להתקדם בביטחון."') },

  @{ slug='service-business'; title='רישוי עסקים'; hkey='business';
     heading='פותחים עסק או נדרשים להסדיר רישיון קיים?';
     lead='מתכננים את העסק כך שיעמוד בדרישות — ויוכל לפעול בראש שקט.';
     img='https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop';
     intro=@('רישוי עסק מתחיל בהבנה האם העסק חייב ברישוי, ובבדיקת התאמת הנכס לדרישות.','אנחנו בונים תכנית עסק שעונה על דרישות הנגישות, הבטיחות והתברואה, ומלווים את התהליך מול הרשות.');
     topics=@(
        @('חובת רישוי','בדיקה האם וכיצד העסק חייב ברישיון.'),
        @('התאמת הנכס','בחינת התאמת המבנה לדרישות הרישוי.'),
        @('תכנית עסק','הכנת התכנית הנדרשת להגשה.'),
        @('נגישות','תכנון בהתאם לדרישות הנגישות.'),
        @('בטיחות וכיבוי אש','התאמה לדרישות הבטיחות הרלוונטיות.'),
        @('עבודה מול הרשות','ליווי מול גורמי הרישוי עד לאישור.'));
     benefits=@(
        @('01','בהירות מההתחלה','הבנה מדויקת מה נדרש מהעסק שלכם.'),
        @('02','תכנון עומד בדרישות','התאמה לנגישות, בטיחות ותברואה.'),
        @('03','ראש שקט','ליווי מול הרשות עד לקבלת הרישיון.'));
     advisors=$false; note=$null;
     faqs=@(
        @('איך יודעים אם העסק חייב ברישוי?','בשלב הראשון בודקים את סוג הפעילות ואת התאמת הנכס — ומכאן נגזרות דרישות הרישוי.'),
        @('האם אפשר להסדיר רישיון קיים?','כן, ניתן ללוות גם התאמה והסדרה של עסק פעיל מול הרשות.'),
        @('מה כוללת תכנית העסק?','התאמת הנכס, נגישות, בטיחות ותברואה — לפי דרישות הרשות הרלוונטית.'));
     story=@('עסק מקומי','נתניה','מהתאמת נכס לרישיון עסק פעיל','המצב: נכס שנדרש להתאמה לצורכי רישוי. הפעולה: תכנית עסק והתאמה לדרישות. התוצאה: הגשה מסודרת מול הרשות.','"הכול היה מסודר ומדויק, בלי הפתעות בדרך."') },

  @{ slug='service-farms'; title='משקים ונחלות'; hkey='farms';
     heading='רוצים להבין מה ניתן להסדיר במשק?';
     lead='עושים סדר במצב הבנייה במשק ומייצרים תכנית פעולה ברורה.';
     img='https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop';
     intro=@('במשקים ובנחלות המצב התכנוני מורכב — ריבוי מבנים, היתרים ישנים ובנייה שנוספה עם השנים.','אנחנו אוספים את התמונה המלאה, משווים את הבנוי בפועל למותר, ובונים תכנית פעולה מדורגת להסדרה.');
     topics=@(
        @('מצב תכנוני','מיפוי כולל של המצב במשק.'),
        @('איסוף היתרים','ריכוז ההיתרים והתכניות הקיימים.'),
        @('מדידה','מדידת המצב הקיים בשטח.'),
        @('השוואת בנייה בפועל','זיהוי הפער בין הבנוי למאושר.'),
        @('איתור חריגות','מיפוי מדויק של חריגות קיימות.'),
        @('תכנית פעולה מדורגת','סדר עדיפויות ברור להסדרה ולמבנים חדשים.'));
     benefits=@(
        @('01','סדר בכאוס','תמונה תכנונית מלאה של משק מורכב.'),
        @('02','זיהוי מדויק','השוואה בין הבנוי בפועל למאושר.'),
        @('03','תכנית מדורגת','מסלול ברור להסדרה, שלב אחר שלב.'));
     advisors=$false; note=$null;
     faqs=@(
        @('מאיפה מתחילים בהסדרת משק?','מאיסוף ההיתרים והתכניות וממדידת המצב הקיים — כדי לבנות תמונה תכנונית מלאה.'),
        @('האם אפשר להסדיר בנייה ותיקה במשק?','בחינת ההתאמה להוראות התכנון היא חלק מהעבודה, בכפוף לנסיבות ולהחלטות הרשויות.'),
        @('מה זו תכנית פעולה מדורגת?','סדר עדיפויות ברור: מה מסדירים קודם, ומה מתכננים בהמשך.'));
     story=@('בעל נחלה','עמק חפר','מסדר במצב הבנייה לתכנית פעולה ברורה','המצב: ריבוי מבנים ללא תמונה תכנונית ברורה. הפעולה: איסוף היתרים, מדידה והשוואה. התוצאה: תכנית פעולה מדורגת להסדרה.','"סוף סוף הבנו מה יש לנו ומה אפשר לעשות עם זה."') }
)

foreach ($s in $services) {
  # topics -> feature-list
  $topicsHtml = ($s.topics | ForEach-Object {
    '      <li><span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" stroke-width="1.8"/></svg></span><div><b>' + $_[0] + '</b><span>' + $_[1] + '</span></div></li>'
  }) -join "`n"

  $benefitsHtml = ($s.benefits | ForEach-Object {
    '      <div class="benefit"><div class="bn">' + $_[0] + '</div><h4>' + $_[1] + '</h4><p>' + $_[2] + '</p></div>'
  }) -join "`n"

  $faqHtml = ($s.faqs | ForEach-Object {
    '      <div class="faq-item"><button class="faq-q" type="button"><span>' + $_[0] + '</span><span class="plus" aria-hidden="true">+</span></button><div class="faq-a"><p>' + $_[1] + '</p></div></div>'
  }) -join "`n"

  $introHtml = ($s.intro | ForEach-Object { '        <p>' + $_ + '</p>' }) -join "`n"

  $advisorsHtml = ''
  if ($s.advisors) {
    $advisorsHtml = @'
<section class="wrap-section on-dark">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">מעטפת אנשי מקצוע</p><h2>כל היועצים תחת גורם אחד</h2><p>המשרד מרכז ומנהל את בעלי המקצוע הנדרשים — כך שאתם לא צריכים לתאם אף גורם בעצמכם.</p></div>
    <div class="chain reveal">
      <div class="chain-node"><div class="dot">01</div><span>אדריכל</span></div><div class="chain-line"></div>
      <div class="chain-node"><div class="dot">02</div><span>מודד מוסמך</span></div><div class="chain-line"></div>
      <div class="chain-node"><div class="dot">03</div><span>מהנדס וקונסטרוקטור</span></div><div class="chain-line"></div>
      <div class="chain-node"><div class="dot">04</div><span>יועצים נוספים</span></div><div class="chain-line"></div>
      <div class="chain-node"><div class="dot">05</div><span>רשויות וועדות</span></div><div class="chain-line"></div>
      <div class="chain-node"><div class="dot">06</div><span>היתר וביצוע</span></div>
    </div>
  </div>
</section>
'@
  }

  $noteHtml = ''
  if ($s.note) {
    $noteHtml = '        <div class="note-box reveal" style="margin-top:32px;"><b>' + $s.note[0] + '</b><p>' + $s.note[1] + '</p></div>'
  }

  $st = $s.story
  $storyHtml = @"
<section class="story-alt">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">סיפור הצלחה</p><h2>מהאתגר ועד לתוצאה</h2></div>
    <div class="story reveal">
      <div class="story-img"><span>$($st[0]) &middot; $($st[1])</span></div>
      <div class="story-body">
        <h3>$($st[2])</h3>
        <div class="story-steps"><div>$($st[3])</div></div>
        <blockquote>$($st[4])</blockquote>
        <cite>$($st[0]), $($st[1])</cite>
      </div>
    </div>
  </div>
</section>
"@

  $body = @"
<main id="main">
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><a href="services.html">שירותים</a><span class="sep">/</span><span aria-current="page">$($s.title)</span></nav>
    <p class="eyebrow">שירות</p>
    <h1>$($s.title)</h1>
    <p class="lead">$($s.lead)</p>
    <div style="margin-top:32px; display:flex; gap:14px; flex-wrap:wrap;">
      <a href="contact.html?service=$($s.hkey)" class="btn btn-bronze">לתיאום בדיקה ראשונית</a>
      <a href="projects.html" class="btn btn-on-dark">לצפייה בפרויקטים</a>
    </div>
  </div>
</section>

<section>
  <div class="wrap split">
    <div class="reveal">
      <p class="eyebrow">הצורך</p>
      <h2 style="margin-top:18px; font-size:clamp(26px,3.4vw,40px);">מאיפה מתחילים</h2>
      <div class="prose" style="margin-top:22px;">
$introHtml
      </div>
$noteHtml
    </div>
    <div class="figure-frame reveal"><img src="$($s.img)" alt="$($s.title) — David Balaish Architecture" loading="lazy"></div>
  </div>
</section>

<section style="background:var(--bg-alt); padding-top:90px;">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">פירוט השירות</p><h2>מה כולל הליווי</h2></div>
    <ul class="feature-list reveal">
$topicsHtml
    </ul>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">יתרונות</p><h2>למה זה עובד</h2></div>
    <div class="benefits reveal">
$benefitsHtml
    </div>
  </div>
</section>

$PROCESS
$advisorsHtml
<section style="background:var(--bg-alt);">
  <div class="wrap">
    <div class="proj-head reveal">
      <div><p class="eyebrow">פרויקטים מהתחום</p><h2 style="margin-top:18px; font-size:clamp(26px,3.4vw,40px);">עבודות נבחרות</h2></div>
      <a href="projects.html?cat=$($s.hkey)" class="btn btn-ghost">לכל הפרויקטים</a>
    </div>
    <div class="proj-grid reveal">
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>$($s.title)</h4><span class="city">$($st[1])</span></div></a>
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>$($s.title)</h4><span class="city">מרכז</span></div></a>
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>$($s.title)</h4><span class="city">השרון</span></div></a>
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>$($s.title)</h4><span class="city">צפון</span></div></a>
    </div>
  </div>
</section>

$storyHtml

<section>
  <div class="wrap" style="max-width:920px;">
    <div class="sec-head reveal"><p class="eyebrow">שאלות נפוצות</p><h2>שאלות שחוזרות בתחום הזה</h2></div>
    <div class="faq reveal">
$faqHtml
    </div>
  </div>
</section>

$(Get-Contact $s.hkey $s.heading)
</main>
"@

  $page = (Head-Block $s.title $s.lead ($s.slug + '.html')) + $HEADER + $body + $FOOTER
  $out = Join-Path $root ($s.slug + '.html')
  [IO.File]::WriteAllText($out, $page, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "wrote $out"
}
Write-Host "DONE"
