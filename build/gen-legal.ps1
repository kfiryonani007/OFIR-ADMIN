$ErrorActionPreference = 'Stop'
. 'C:\Users\user\Desktop\david\build\common.ps1'

# =========================================================
# contact.html
# =========================================================
$body = @"
<main id="main">
<section class="page-hero" style="padding-bottom:40px;">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><span aria-current="page">יצירת קשר</span></nav>
    <p class="eyebrow">יצירת קשר</p>
    <h1>מתכננים לבנות, להרחיב או להסדיר?</h1>
    <p class="lead">בואו נתחיל בבדיקת הנכס והצרכים. מלאו את הפרטים ונחזור אליכם בהקדם — או פשוט התקשרו.</p>
    <div style="margin-top:30px; display:flex; gap:14px; flex-wrap:wrap;">
      <a href="tel:0503851111" class="btn btn-bronze">חייגו 050-385-1111</a>
      <a href="https://wa.me/972503851111" target="_blank" rel="noopener" class="btn btn-on-dark">וואטסאפ</a>
    </div>
  </div>
</section>
$(Get-Contact '' 'שלחו פנייה ונחזור אליכם' '')
</main>
"@
Save-Page 'contact.html' (Head-Block 'יצירת קשר' 'צרו קשר עם David Balaish Architecture — טלפון 050-385-1111, דוא"ל kfiryonani@icloud.com. פנייה לתיאום שיחת היכרות ללא התחייבות.' 'contact.html') $body

# =========================================================
# thank-you.html
# =========================================================
$body = @"
<main id="main">
<section class="thanks">
  <div class="wrap" style="text-align:center; max-width:640px;">
    <div class="mark" style="margin-inline:auto;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12l5 5 11-11" stroke="currentColor" stroke-width="1.8"/></svg></div>
    <p class="eyebrow" style="justify-content:center;">הפנייה התקבלה</p>
    <h1 style="font-size:clamp(30px,5vw,52px); margin-top:18px;">תודה! קיבלנו את הפנייה שלכם</h1>
    <p style="color:var(--ink-soft); font-size:17px; margin-top:18px;">ניצור אתכם קשר בהקדם לתיאום שיחת היכרות ראשונית. בינתיים, אתם מוזמנים לעיין בפרויקטים או להתקשר ישירות.</p>
    <div style="margin-top:34px; display:flex; gap:14px; justify-content:center; flex-wrap:wrap;">
      <a href="projects.html" class="btn btn-solid">לצפייה בפרויקטים</a>
      <a href="tel:0503851111" class="btn btn-ghost">050-385-1111</a>
    </div>
  </div>
</section>
</main>
"@
Save-Page 'thank-you.html' (Head-Block 'תודה על הפנייה' 'תודה שפניתם ל-David Balaish Architecture. נחזור אליכם בהקדם.' 'thank-you.html') $body

# =========================================================
# privacy.html
# =========================================================
$body = @"
<main id="main">
<section class="page-hero" style="padding-bottom:50px;">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><span aria-current="page">מדיניות פרטיות</span></nav>
    <p class="eyebrow">מסמך</p>
    <h1>מדיניות פרטיות</h1>
  </div>
</section>
<section>
  <div class="wrap doc reveal">
    <p class="updated">עודכן לאחרונה: יולי 2026</p>
    <p>מסמך זה מפרט כיצד משרד David Balaish Architecture ("המשרד") אוסף, משתמש ושומר מידע שנמסר דרך אתר האינטרנט. השימוש באתר ומסירת פרטים מהווים הסכמה למדיניות זו.</p>
    <h2>איזה מידע נאסף</h2>
    <p>בעת מילוי טופס יצירת קשר אנו אוספים את הפרטים שאתם בוחרים למסור: שם, טלפון, דוא"ל, עיר/יישוב, סוג השירות, תיאור הפנייה וקבצים שצירפתם. כמו כן נאסף מידע טכני בסיסי כגון עמוד המקור, כתובת ה-URL ומקור התנועה.</p>
    <h2>למה משמש המידע</h2>
    <ul class="bullets">
      <li>יצירת קשר חוזר ומענה לפנייה שלכם.</li>
      <li>תיאום שיחת היכרות והצעת שירות מתאימה.</li>
      <li>ניהול פנימי של פניות ושיפור השירות.</li>
    </ul>
    <h2>שמירה ואבטחה</h2>
    <p>המידע נשמר במערכות המשרד ומועבר לצורך טיפול בפנייה בלבד. אנו נוקטים אמצעים סבירים לאבטחת המידע, אך אין באפשרותנו להבטיח הגנה מוחלטת מפני כל סיכון.</p>
    <h2>מסירה לצד שלישי</h2>
    <p>איננו מוכרים או משכירים את המידע. מסירת מידע לגורם שלישי תיעשה רק לצורך מתן השירות (למשל יועצים בפרויקט) או אם נדרש לפי דין.</p>
    <h2>הזכויות שלכם</h2>
    <p>באפשרותכם לפנות אלינו בכל עת בבקשה לעיין במידע שנשמר עליכם, לתקנו או לבקש את מחיקתו, בכתובת <a href="mailto:kfiryonani@icloud.com" style="text-decoration:underline;">kfiryonani@icloud.com</a>.</p>
    <h2>יצירת קשר</h2>
    <p>לשאלות בנוגע למדיניות זו: טלפון 050-385-1111, דוא"ל kfiryonani@icloud.com.</p>
  </div>
</section>
</main>
"@
Save-Page 'privacy.html' (Head-Block 'מדיניות פרטיות' 'מדיניות הפרטיות של אתר David Balaish Architecture — איסוף, שימוש ושמירת מידע מפניות באתר.' 'privacy.html') $body

# =========================================================
# accessibility.html
# =========================================================
$body = @"
<main id="main">
<section class="page-hero" style="padding-bottom:50px;">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><span aria-current="page">הצהרת נגישות</span></nav>
    <p class="eyebrow">מסמך</p>
    <h1>הצהרת נגישות</h1>
  </div>
</section>
<section>
  <div class="wrap doc reveal">
    <p class="updated">עודכן לאחרונה: יולי 2026</p>
    <p>משרד David Balaish Architecture רואה חשיבות רבה בהנגשת האתר לכלל המשתמשים, לרבות אנשים עם מוגבלות, ופועל להתאמת האתר להנחיות הנגישות המקובלות (WCAG) ככל האפשר.</p>
    <h2>מה הונגש באתר</h2>
    <ul class="bullets">
      <li>מבנה סמנטי וכותרות מדורגות לניווט ברור.</li>
      <li>ניווט מלא באמצעות מקלדת וסימון מיקוד (focus) נראה.</li>
      <li>ניגודיות צבעים מותאמת לקריאוּת הטקסט.</li>
      <li>טקסט חלופי לתמונות ותוויות לשדות טופס.</li>
      <li>תמיכה בהעדפת "הפחתת תנועה" (reduced motion) של המערכת.</li>
      <li>קישור "דלג לתוכן הראשי" בתחילת כל עמוד.</li>
    </ul>
    <h2>דרכי פנייה בנושא נגישות</h2>
    <p>נתקלתם בקושי בנגישות האתר? נשמח לדעת ולתקן. ניתן לפנות לרכז הנגישות של המשרד:</p>
    <ul class="bullets">
      <li>טלפון: 050-385-1111</li>
      <li>דוא"ל: kfiryonani@icloud.com</li>
    </ul>
    <p>נטפל בפנייתכם בהקדם ונעשה מאמץ לספק מענה הולם.</p>
  </div>
</section>
</main>
"@
Save-Page 'accessibility.html' (Head-Block 'הצהרת נגישות' 'הצהרת הנגישות של אתר David Balaish Architecture והתאמתו להנחיות WCAG.' 'accessibility.html') $body

# =========================================================
# terms.html
# =========================================================
$body = @"
<main id="main">
<section class="page-hero" style="padding-bottom:50px;">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><span aria-current="page">תנאי שימוש</span></nav>
    <p class="eyebrow">מסמך</p>
    <h1>תנאי שימוש</h1>
  </div>
</section>
<section>
  <div class="wrap doc reveal">
    <p class="updated">עודכן לאחרונה: יולי 2026</p>
    <p>השימוש באתר David Balaish Architecture כפוף לתנאים המפורטים להלן. הגלישה באתר מהווה הסכמה לתנאים אלו.</p>
    <h2>תוכן האתר</h2>
    <p>המידע באתר הוא כללי ונועד להתרשמות ראשונית בלבד. אין לראות בו ייעוץ מקצועי, משפטי או תכנוני מחייב, ואין להסתמך עליו לקבלת החלטות ללא בדיקה פרטנית מול המשרד.</p>
    <h2>אין התחייבות לתוצאה</h2>
    <p>תיאורי השירותים באתר, לרבות בתחומי היתרי בנייה, הסדרת חריגות ובריכות שחייה, מתייחסים למטרות מקצועיות התלויות בנסיבות המקרה ובהחלטות הרשויות המוסמכות. אין באמור באתר משום התחייבות לתוצאה מסוימת, אלא בכפוף לתנאים שייקבעו בהסכם התקשרות פרטני.</p>
    <h2>קניין רוחני</h2>
    <p>כל התכנים, העיצוב, הטקסטים והתמונות באתר הם רכוש המשרד או בשימושו כדין. אין להעתיק, לשכפל או לעשות שימוש מסחרי בתכנים ללא אישור בכתב.</p>
    <h2>קישורים חיצוניים</h2>
    <p>האתר עשוי לכלול קישורים לאתרים חיצוניים. המשרד אינו אחראי לתוכן או למדיניות של אתרים אלו.</p>
    <h2>שינויים</h2>
    <p>המשרד רשאי לעדכן תנאים אלו מעת לעת. הנוסח המחייב הוא זה המפורסם באתר במועד השימוש.</p>
    <h2>יצירת קשר</h2>
    <p>לשאלות בנוגע לתנאי השימוש: טלפון 050-385-1111, דוא"ל kfiryonani@icloud.com.</p>
  </div>
</section>
</main>
"@
Save-Page 'terms.html' (Head-Block 'תנאי שימוש' 'תנאי השימוש באתר David Balaish Architecture.' 'terms.html') $body

Write-Host "LEGAL DONE"
