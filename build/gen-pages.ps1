$ErrorActionPreference = 'Stop'
. 'C:\Users\user\Desktop\david\build\common.ps1'

$arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6"/></svg>'

$PROCESS = @'
<section class="wrap-section on-dark">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">איך מתחילים?</p><h2>תהליך ברור, בשישה צעדים</h2></div>
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

# =========================================================
# services.html — overview
# =========================================================
$svcCards = @(
  @('service-homes','01','בתים פרטיים','מהחלום המשפחתי ועד לתכנית עבודה מלאה ומאושרת.'),
  @('service-interior','02','עיצוב ותכנון פנים','תכנון חללים שמתאים לשגרת החיים האמיתית שלכם.'),
  @('service-permits','03','היתרי בנייה והסדרת חריגות','מהמצב הקיים בשטח לתכנון חוקי, מסודר ומאושר.'),
  @('service-pools','04','בריכות שחייה','מהרעיון בחצר לבריכה מתוכננת, בטוחה ומאושרת.'),
  @('service-business','05','רישוי עסקים','מתכננים את העסק כך שיעמוד בדרישות ויפעל בראש שקט.'),
  @('service-farms','06','משקים ונחלות','עושים סדר במצב הבנייה במשק ובונים תכנית פעולה ברורה.')
)
$svcCardsHtml = ($svcCards | ForEach-Object {
  '    <a href="' + $_[0] + '.html" class="exp-card"><div class="exp-num">' + $_[1] + '</div><div><h3>' + $_[2] + '</h3><p>' + $_[3] + '</p></div><span class="go">למידע נוסף ←</span></a>'
}) -join "`n"

$body = @"
<main id="main">
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><span aria-current="page">שירותים</span></nav>
    <p class="eyebrow">שירותים</p>
    <h1>מעטפת תכנון מלאה, בכל תחום שנוגע לנכס שלכם</h1>
    <p class="lead">שישה תחומי ליבה, שכל אחד מהם נבנה כפרויקט בפני עצמו — מהבנת הצורך ועד לקבלת האישור הסופי, תחת גורם אחד.</p>
  </div>
</section>
<section>
  <div class="wrap"><div class="card-grid reveal">
$svcCardsHtml
  </div></div>
</section>
$PROCESS
$(Get-Contact '' 'מתכננים לבנות, להרחיב או להסדיר?<br>בואו נתחיל בבדיקת הנכס והצרכים.' '')
</main>
"@
Save-Page 'services.html' (Head-Block 'שירותים' 'מעטפת תכנון מלאה — בתים פרטיים, עיצוב פנים, היתרי בנייה, בריכות, רישוי עסקים ומשקים. גורם אחד שמרכז את כל התהליך.' 'services.html') $body

# =========================================================
# about.html
# =========================================================
$values = @(
  @('01','ליווי אישי','כתובת אחת שמכירה את הפרויקט שלכם לעומק — מהשיחה הראשונה ועד לאישור.'),
  @('02','שקיפות','לוחות זמנים, שלבים ועלויות ברורים מראש, בלי הפתעות בדרך.'),
  @('03','ראייה רגולטורית','הבנה מעמיקה של דרישות התכנון והעבודה מול ועדות ורשויות.'),
  @('04','גורם מתכלל','ריכוז כל בעלי המקצוע והיועצים תחת ניהול אחד.')
)
$valuesHtml = ($values | ForEach-Object {
  '    <div class="value"><div class="vn">' + $_[0] + '</div><h4>' + $_[1] + '</h4><p>' + $_[2] + '</p></div>'
}) -join "`n"

$body = @"
<main id="main">
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><span aria-current="page">אודות</span></nav>
    <p class="eyebrow">אודות המשרד</p>
    <h1>גורם אחד שמוביל את כל התהליך — מהרעיון ועד ההיתר</h1>
    <p class="lead">משרד David Balaish Architecture מלווה משפחות, בעלי נכסים ובעלי עסקים בכל רחבי הארץ — משלב הבדיקה הראשונית ועד להשלמת הפרויקט.</p>
  </div>
</section>

<section>
  <div class="wrap about">
    <div class="about-figure reveal">
      <div class="frame"><img src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=900&auto=format&fit=crop" alt="חזית מבנה אדריכלי בקווים נקיים" loading="lazy"></div>
      <div class="stat-card"><b>10+</b><span>שנות ניסיון בתכנון והיתרים</span></div>
    </div>
    <div class="about-text reveal">
      <p class="eyebrow">מי אנחנו</p>
      <h2 style="margin-top:20px; font-size:clamp(26px,3.4vw,40px);">משרד שמחבר תכנון, רגולציה וניסיון מוכח</h2>
      <div class="prose" style="margin-top:22px;">
        <p>המשרד משמש כגורם מתכלל אחד, ומרכז את כל בעלי המקצוע והיועצים הנדרשים לפרויקט — אדריכל, מודד, מהנדס ויועצים נוספים — כך שאתם מול כתובת אחת בלבד.</p>
        <p>הגישה משלבת ראייה תכנונית, הבנה רגולטורית מעמיקה וניסיון מול ועדות ורשויות, כדי להפוך תהליך שנתפס כמורכב לתהליך ברור, מלווה ושקוף.</p>
      </div>
      <div class="about-tags">
        <span>פעילות בכל הארץ</span><span>ליווי אישי מלא</span><span>ניסיון מול ועדות ורשויות</span><span>בדיקת היתכנות מקדימה</span>
      </div>
    </div>
  </div>
</section>

<section style="background:var(--bg-alt);">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">הערכים שלנו</p><h2>איך אנחנו עובדים</h2></div>
    <div class="values reveal">
$valuesHtml
    </div>
  </div>
</section>

<section class="wrap-section on-dark">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">מעטפת 360°</p><h2>כתובת אחת שמרכזת עבורכם את כל התהליך</h2></div>
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
$(Get-Contact '' 'רוצים להכיר?<br>בואו נתחיל בשיחה קצרה.' '')
</main>
"@
Save-Page 'about.html' (Head-Block 'אודות המשרד' 'משרד אדריכלות David Balaish — גורם מתכלל אחד לתכנון, היתרים ומעטפת מקצועית מלאה, עם ניסיון מול ועדות ורשויות בכל הארץ.' 'about.html') $body

# =========================================================
# projects.html — grid + filter
# =========================================================
$projects = @(
  @('וילה משפחתית','כפר סבא','homes'),
  @('בית עם בריכה','רעננה','homes,pools'),
  @('הסדרת חריגות','תל אביב','permits'),
  @('משק חקלאי','עמק חפר','farms'),
  @('תכנון פנים','הרצליה','interior'),
  @('בית עסק ורישוי','נתניה','business'),
  @('בית פרטי במדרון','זכרון יעקב','homes'),
  @('בריכה בחצר','כפר שמריהו','pools'),
  @('הסדרת מבנים במשק','עמק יזרעאל','farms,permits'),
  @('חידוש פנים לדירה','גבעתיים','interior'),
  @('רישוי בית קפה','תל אביב','business'),
  @('תוספת בנייה ומרפסת','רמת השרון','permits,homes')
)
$projCards = ($projects | ForEach-Object {
  '      <a class="proj-card" href="project.html" data-cats="' + $_[2] + '"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>' + $_[0] + '</h4><span class="city">' + $_[1] + '</span></div></a>'
}) -join "`n"

$pills = @(
  @('all','הכל'),@('homes','בתים פרטיים'),@('interior','עיצוב פנים'),
  @('permits','היתרים וחריגות'),@('pools','בריכות'),@('business','רישוי עסקים'),@('farms','משקים ונחלות')
)
$pillsHtml = ($pills | ForEach-Object {
  $act = if ($_[0] -eq 'all') { ' active' } else { '' }
  $pr  = if ($_[0] -eq 'all') { 'true' } else { 'false' }
  '      <button class="pill' + $act + '" type="button" data-filter="' + $_[0] + '" aria-pressed="' + $pr + '">' + $_[1] + '</button>'
}) -join "`n"

$body = @"
<main id="main">
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><span aria-current="page">פרויקטים</span></nav>
    <p class="eyebrow">פרויקטים</p>
    <h1>עבודות נבחרות מתוך תיק הפרויקטים</h1>
    <p class="lead">מבחר פרויקטים מכל תחומי הפעילות — סננו לפי תחום כדי לראות עבודות רלוונטיות.</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="filter-bar reveal" role="group" aria-label="סינון פרויקטים לפי תחום">
$pillsHtml
    </div>
    <p class="proj-count" aria-live="polite">מוצגים $($projects.Count) פרויקטים</p>
    <div class="proj-grid full reveal">
$projCards
    </div>
  </div>
</section>
$(Get-Contact '' 'אהבתם משהו שראיתם?<br>בואו נדבר על הפרויקט שלכם.' '')
</main>
"@
Save-Page 'projects.html' (Head-Block 'פרויקטים' 'תיק העבודות של David Balaish Architecture — בתים פרטיים, עיצוב פנים, היתרים, בריכות, רישוי עסקים ומשקים. סינון לפי תחום.' 'projects.html') $body

# =========================================================
# project.html — single project (exemplar)
# =========================================================
$gallery = 1..6 | ForEach-Object {
  '      <button type="button" aria-label="הגדלת תמונה ' + $_ + '"><img src="https://images.unsplash.com/photo-16003852793' + ($_+40) + '?q=80&w=700&auto=format&fit=crop" alt="תמונת פרויקט ' + $_ + '" loading="lazy" onerror="this.style.display=''none''"></button>'
}
$galleryHtml = $gallery -join "`n"

$body = @"
<main id="main">
<section class="page-hero" style="padding-bottom:40px;">
  <div class="wrap">
    <nav class="crumbs" aria-label="נתיב ניווט"><a href="index.html">בית</a><span class="sep">/</span><a href="projects.html">פרויקטים</a><span class="sep">/</span><span aria-current="page">וילה משפחתית, כפר סבא</span></nav>
    <p class="eyebrow">פרויקט</p>
    <h1>וילה משפחתית</h1>
    <p class="lead">בית פרטי בכפר סבא — תכנון כולל מהבדיקה הראשונית ועד לתכניות העבודה וההיתר.</p>
  </div>
</section>

<section style="padding-top:40px;">
  <div class="wrap">
    <div class="proj-hero-img reveal"><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop" alt="חזית הווילה" loading="lazy"></div>
  </div>
</section>

<section style="padding-top:20px;">
  <div class="wrap proj-layout">
    <div class="reveal">
      <div class="proj-block"><h3>הפרויקט</h3><p>וילה משפחתית שתוכננה מתוך היכרות מעמיקה עם המגרש והצרכים המשפחתיים. התכנון חיבר בין זכויות הבנייה, כיווני האוויר והשפה האדריכלית לכדי בית שלם ומדויק.</p></div>
      <div class="proj-block"><h3>האתגר</h3><p>מגרש עם טופוגרפיה משתנה ופרוגרמה משפחתית עשירה, שדרשו איזון בין ניצול זכויות הבנייה לבין תחושת מרחב ופרטיות.</p></div>
      <div class="proj-block"><h3>הפתרון</h3><p>העמדה חכמה של הבית במגרש, חלוקה פנימית לפי שגרת המשפחה, וחזיתות נקיות שמדברות בשפה אחת עם החצר והבריכה.</p></div>
      <div class="data-stats reveal">
        <div><b>3</b><span>מפלסים מתוכננים</span></div>
        <div><b>6</b><span>יועצים בריכוז המשרד</span></div>
        <div><b>1</b><span>כתובת אחת לאורך כל התהליך</span></div>
      </div>
      <div class="proj-block"><h3>התוצאה</h3><p>תכנית עבודה מלאה שהוגשה לוועדה, עם ליווי מקצועי עד לקבלת ההיתר ותחילת הביצוע.</p></div>

      <div class="proj-block">
        <h3>גלריה</h3>
        <div class="gallery">
$galleryHtml
        </div>
      </div>

      <blockquote style="font-family:var(--serif); font-size:22px; border-inline-start:2px solid var(--bronze); padding-inline-start:22px; margin-top:10px;">
        "קיבלנו ליווי צמוד לאורך כל הדרך, עם תשובות ברורות בכל שלב."
        <cite style="display:block; margin-top:12px; font-style:normal; font-size:14px; color:var(--ink-faint); font-weight:600;">משפחת לוי, כפר סבא</cite>
      </blockquote>
    </div>

    <aside class="proj-side reveal">
      <dl>
        <div><dt>עיר</dt><dd>כפר סבא</dd></div>
        <div><dt>תחומים</dt><dd class="tags"><span>בתים פרטיים</span></dd></div>
        <div><dt>שירותים שסופקו</dt><dd>תכנון אדריכלי, תיאום יועצים, היתר בנייה, תכניות עבודה</dd></div>
        <div><dt>סטטוס</dt><dd>הוגש היתר</dd></div>
      </dl>
      <a href="#contact" class="btn btn-bronze" style="width:100%; justify-content:center; margin-top:26px;">פרויקט דומה? דברו איתנו</a>
    </aside>
  </div>
</section>

<section style="background:var(--bg-alt);">
  <div class="wrap">
    <div class="proj-head reveal"><div><p class="eyebrow">פרויקטים דומים</p><h2 style="margin-top:18px; font-size:clamp(26px,3.4vw,40px);">עבודות נוספות</h2></div><a href="projects.html" class="btn btn-ghost">לכל הפרויקטים</a></div>
    <div class="proj-grid reveal">
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>בית עם בריכה</h4><span class="city">רעננה</span></div></a>
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>בית פרטי במדרון</h4><span class="city">זכרון יעקב</span></div></a>
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>תוספת בנייה ומרפסת</h4><span class="city">רמת השרון</span></div></a>
      <a class="proj-card" href="project.html"><div class="ph" data-label="David Balaish Architecture"></div><div class="meta"><h4>תכנון פנים</h4><span class="city">הרצליה</span></div></a>
    </div>
  </div>
</section>
$(Get-Contact 'homes' 'מתכננים לבנות בית? בואו נתחיל בבדיקת המגרש והצרכים.' 'וילה משפחתית — כפר סבא')
</main>
<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="תצוגת תמונה">
  <button class="lightbox-close" aria-label="סגירה">&times;</button>
  <img src="" alt="">
</div>
"@
Save-Page 'project.html' (Head-Block 'וילה משפחתית, כפר סבא' 'פרויקט וילה משפחתית בכפר סבא — תכנון אדריכלי מלא, תיאום יועצים והיתר בנייה, בליווי David Balaish Architecture.' 'project.html') $body

Write-Host "PAGES DONE"
