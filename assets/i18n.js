/* ============================================================
   David Balaish Architecture — HE/EN language switch
   Phrase-map i18n: walks text nodes, swaps HE<->EN, flips dir.
   No markup keys required. Persists choice in localStorage.
   ============================================================ */
(function () {
  'use strict';

  // Hebrew (as it appears in the HTML)  ->  English
  var DICT = {
    // --- skip link / chrome ---
    "דלג לתוכן הראשי": "Skip to main content",
    "פנייה בוואטסאפ": "Contact via WhatsApp",

    // --- nav ---
    "בית": "Home",
    "מי אנחנו": "Who We Are",
    "אודות": "About",
    "שירותים": "Services",
    "פרויקטים": "Projects",
    "יצירת קשר": "Contact",
    "לתיאום פגישה": "Book a Meeting",
    "עיצוב ופיתוח": "Design & Development",
    "מהתיק שלנו": "From Our Portfolio",
    "פרויקט רלוונטי לעמוד הזה": "A Relevant Project",
    "לצפייה בפרויקט": "View Project",
    "תודה!": "Thank you!",
    "קיבלנו את הפנייה שלכם": "We've received your inquiry",
    "לתיאום פגישת ייעוץ": "Book a Consultation",

    // --- services (used in nav, cards, footer, select) ---
    "בתים פרטיים": "Private Homes",
    "עיצוב ותכנון פנים": "Interior Design",
    "היתרי בנייה והסדרת חריגות": "Building Permits & Regularization",
    "בריכות שחייה": "Swimming Pools",
    "רישוי עסקים": "Business Licensing",
    "משקים ונחלות": "Farms & Estates",
    "היתרי בנייה": "Building Permits",
    "עיצוב פנים": "Interior Design",
    "היתרים וחריגות": "Permits & Regularization",

    // --- hero ---
    "מתכננים נכון. פותרים מורכב.": "We plan right. We solve complexity.",
    // the hero's first word is its own <span> for the accent styling,
    // so it translates as a separate text node
    "מתכננים": "We plan",
    "נכון. פותרים מורכב.": "right. We solve complexity.",
    "הופכים חזון למציאות.": "We turn vision into reality.",
    "תכנון אדריכלי, היתרי בנייה ומעטפת מקצועית מלאה — משלב הבדיקה הראשונית ועד להשלמת הפרויקט.":
      "Architectural design, building permits and a complete professional envelope — from the first feasibility check to project completion.",
    "לצפייה בפרויקטים": "View Projects",
    "תכנון בתים פרטיים": "Private Home Design",
    "גללו למטה": "Scroll down",
    "מתכננים.": "We plan.",
    "פותרים.": "We solve.",
    "מבצעים.": "We build.",

    // --- about ---
    "אודות המשרד": "About the Studio",
    "גורם אחד שמוביל את כל התהליך — מהרעיון ועד ההיתר": "One team that leads the entire process — from idea to permit",
    "משרד David Balaish Architecture מלווה משפחות, בעלי נכסים ובעלי עסקים בכל רחבי הארץ, משלב בדיקת ההיתכנות הראשונית ועד לקבלת ההיתר והשלמת התכנון. המשרד משמש כגורם מתכלל אחד, ומרכז את כל בעלי המקצוע והיועצים הנדרשים לפרויקט.":
      "David Balaish Architecture accompanies families, property owners and business owners across the country, from the initial feasibility check to obtaining the permit and completing the design. The studio acts as a single coordinating body, bringing together all the professionals and consultants a project requires.",
    "הגישה משלבת ראייה תכנונית, הבנה רגולטורית מעמיקה וניסיון מוכח מול ועדות ורשויות — כדי להפוך תהליך שנתפס כמורכב לתהליך ברור, מלווה ושקוף.":
      "Our approach combines planning vision, deep regulatory understanding and proven experience with committees and authorities — turning a process perceived as complex into one that is clear, guided and transparent.",
    "פעילות בכל הארץ": "Nationwide",
    "ליווי אישי מלא": "Full personal guidance",
    "ניסיון מול ועדות ורשויות": "Experience with committees & authorities",
    "בדיקת היתכנות מקדימה": "Preliminary feasibility check",
    "שנות ניסיון בתכנון והיתרים": "Years of experience in design & permits",
    "עוד על המשרד": "More about the studio",

    // --- expertise ---
    "תחומי התמחות": "Areas of Expertise",
    "מעטפת תכנון מלאה, בכל תחום שנוגע לנכס שלכם": "A complete planning envelope, in every field that touches your property",
    "שישה תחומי ליבה, שכל אחד מהם נבנה כפרויקט בפני עצמו — מהבנת הצורך ועד לקבלת האישור הסופי.":
      "Six core disciplines, each built as a project in its own right — from understanding the need to receiving final approval.",
    "מהחלום המשפחתי ועד לתכנית עבודה מלאה ומאושרת.": "From the family dream to a full, approved working plan.",
    "תכנון חללים שמתאים לשגרת החיים האמיתית שלכם.": "Space planning that fits the real rhythm of your life.",
    "מהמצב הקיים בשטח לתכנון חוקי, מסודר ומאושר.": "From the existing situation on site to a legal, orderly, approved plan.",
    "מהרעיון בחצר לבריכה מתוכננת, בטוחה ומאושרת.": "From the idea in the yard to a planned, safe, approved pool.",
    "מתכננים את העסק כך שיעמוד בדרישות ויפעל בראש שקט.": "Planning the business so it meets requirements and operates with peace of mind.",
    "עושים סדר במצב הבנייה במשק ובונים תכנית פעולה ברורה.": "Bringing order to the building situation on the estate and building a clear action plan.",
    "למידע נוסף ←": "Learn more →",
    "למידע נוסף": "Learn more",

    // --- 360 ---
    "מעטפת 360°": "360° Coverage",
    "כתובת אחת שמרכזת עבורכם את כל התהליך": "One address that centralizes the entire process for you",
    "המשרד מרכז ומנהל את כלל בעלי המקצוע והיועצים הנדרשים לפרויקט — כך שאתם לא צריכים לנהל בעצמכם אף גורם.":
      "The studio coordinates and manages all the professionals and consultants a project needs — so you never have to manage any of them yourself.",
    "אדריכל": "Architect",
    "מודד מוסמך": "Licensed Surveyor",
    "מהנדס וקונסטרוקטור": "Engineer & Structural",
    "יועצים נוספים": "Additional Consultants",
    "רשויות וועדות": "Authorities & Committees",
    "היתר וביצוע": "Permit & Execution",
    "המשרד מוביל את הפרויקט משלב הבדיקה הראשונית ועד לקבלת האישורים.":
      "The studio leads the project from the initial feasibility check to receiving the approvals.",

    // --- process ---
    "איך מתחילים?": "How We Start",
    "תהליך ברור, בשישה צעדים": "A clear process, in six steps",
    "שיחת היכרות והבנת הצורך": "Introductory call & understanding the need",
    "מבינים מה המצב הקיים, מהו החזון ומהם האילוצים.": "We understand the existing situation, the vision and the constraints.",
    "בדיקת הנכס והמסמכים": "Reviewing the property & documents",
    "איסוף היתרים, תכניות ותב\"ע רלוונטיים.": "Collecting relevant permits, plans and zoning schemes.",
    "בדיקת היתכנות תכנונית": "Planning feasibility check",
    "מיפוי מה ניתן וכדאי לבצע, לפני כל התחייבות.": "Mapping what can and should be done, before any commitment.",
    "תכנית פעולה והצעת מחיר": "Action plan & quote",
    "לוחות זמנים, שלבים ועלויות בצורה שקופה.": "Timelines, stages and costs, transparently.",
    "תכנון, תיאום יועצים והגשה": "Design, consultant coordination & submission",
    "פיתוח החלופה, עבודה מול היועצים והגשת הבקשה.": "Developing the concept, working with consultants and submitting the application.",
    "ליווי עד להשלמת התהליך": "Guidance through completion",
    "מלווים אתכם עד לקבלת האישורים ותחילת הביצוע.": "We accompany you until approvals are granted and execution begins.",

    // --- projects ---
    "פרויקטים נבחרים": "Selected Projects",
    "עבודות נבחרות מתוך תיק הפרויקטים": "Selected works from the project portfolio",
    "לכל הפרויקטים": "View all projects",
    "וילה משפחתית": "Family Villa",
    "בית עם בריכה": "House with Pool",
    "הסדרת חריגות": "Regularization",
    "משק חקלאי": "Agricultural Estate",
    "תכנון פנים": "Interior Design",
    "בית עסק ורישוי": "Business & Licensing",
    "כפר סבא": "Kfar Saba",
    "רעננה": "Ra'anana",
    "תל אביב": "Tel Aviv",
    "עמק חפר": "Emek Hefer",
    "הרצליה": "Herzliya",
    "נתניה": "Netanya",

    // --- success stories ---
    "סיפורי הצלחה": "Success Stories",
    "לא המלצה כללית — סיפור מלא, מהאתגר ועד לתוצאה": "Not a generic testimonial — a full story, from challenge to result",
    "מחריגת בנייה להסדרה מלאה מול הרשות": "From a building violation to full regularization with the authority",
    "המצב:": "Situation:",
    "התראה על בנייה שבוצעה ללא היתר.": "A notice of construction carried out without a permit.",
    "הפעולה:": "Action:",
    "בדיקת התכניות והוראות התב\"ע ובניית תכנית הסדרה.": "Reviewing the plans and zoning provisions and building a regularization plan.",
    "התוצאה:": "Result:",
    "התאמת המצב הקיים לדרישות הוועדה.": "Aligning the existing situation with the committee's requirements.",
    "\"ליווי צמוד וברור, מהרגע הראשון ועד לסגירת התיק מול הרשות.\"":
      "\"Close, clear guidance, from the first moment to closing the file with the authority.\"",
    "משפחת כהן, תל אביב": "The Cohen Family, Tel Aviv",
    "משפחת כהן · תל אביב": "The Cohen Family · Tel Aviv",

    // --- FAQ ---
    "שאלות נפוצות": "Frequently Asked Questions",
    "מה שלרוב שואלים אותנו": "What we're most often asked",
    "כמה זמן נמשך תהליך היתר?": "How long does a permit process take?",
    "משך הזמן משתנה בהתאם לסוג הבקשה, מורכבות הנכס והרשות הרלוונטית, ונקבע בבירור כבר בשלב תכנית הפעולה.":
      "The duration depends on the type of application, the complexity of the property and the relevant authority, and is clarified already at the action-plan stage.",
    "אילו מסמכים צריך להביא לפגישה?": "Which documents should I bring to the meeting?",
    "נסמן לכם מראש רשימה מדויקת בהתאם לסוג הפרויקט — לרוב נסח טאבו, היתרים קיימים ותכניות, אם יש.":
      "We'll mark an exact list in advance according to the project type — usually a land registry extract, existing permits and plans, if any.",
    "האם ניתן לבדוק היתכנות לפני תחילת העבודה?": "Can feasibility be checked before work begins?",
    "כן, בדיקת היתכנות תכנונית היא שלב קבוע בתהליך, עוד לפני כל התחייבות מצדכם.":
      "Yes. A planning feasibility check is a fixed stage in the process, before any commitment on your part.",
    "מי מנהל את היועצים?": "Who manages the consultants?",
    "המשרד מתכלל את כל בעלי המקצוע — מודד, מהנדס ויועצים נוספים — כך שאתם לא נדרשים לנהל זאת בעצמכם.":
      "The studio coordinates all professionals — surveyor, engineer and additional consultants — so you don't have to manage it yourself.",
    "באילו רשויות המשרד מטפל?": "Which authorities does the studio work with?",
    "המשרד עובד מול ועדות תכנון ורשויות מקומיות בכל רחבי הארץ.":
      "The studio works with planning committees and local authorities across the country.",
    "האם המשרד מטפל גם בחריגות קיימות?": "Does the studio also handle existing violations?",
    "כן — בחינת המצב הקיים והתאמתו להוראות התב\"ע וההיתר היא חלק מרכזי מהעבודה, בכפוף לנסיבות המקרה ולהחלטות הרשויות.":
      "Yes — reviewing the existing situation and aligning it with the zoning and permit provisions is a central part of the work, subject to the circumstances and the authorities' decisions.",

    // --- contact / form ---
    "מתכננים לבנות, להרחיב או להסדיר?": "Planning to build, expand or regularize?",
    "בואו נתחיל בבדיקת הנכס והצרכים.": "Let's start by reviewing the property and the needs.",
    "מלאו את הפרטים ונחזור אליכם בהקדם לתיאום שיחת היכרות ראשונית, ללא התחייבות.":
      "Fill in your details and we'll get back to you shortly to arrange an initial introductory call, with no obligation.",
    "אינסטגרם — david_balaish@": "Instagram — @david_balaish",
    "פייסבוק — davidbalaishh": "Facebook — davidbalaishh",
    "שם מלא": "Full name",
    "טלפון": "Phone",
    "דוא\"ל": "Email",
    "עיר / יישוב": "City / Town",
    "סוג השירות": "Service type",
    "אחר": "Other",
    "תיאור קצר של הצורך": "Brief description of your need",
    "צירוף מסמך או תמונה (אופציונלי)": "Attach a document or image (optional)",
    "שליחת פנייה": "Send inquiry",
    "נא להזין שם מלא": "Please enter your full name",
    "נא להזין מספר טלפון": "Please enter a phone number",
    "נא להזין כתובת דוא\"ל תקינה": "Please enter a valid email address",

    // --- footer ---
    "משרד אדריכלות המלווה תכנון, היתרים ומעטפת מקצועית מלאה בכל רחבי הארץ.":
      "An architecture studio providing design, permits and a complete professional envelope across the country.",
    "ניווט": "Navigation",
    "מדיניות פרטיות": "Privacy Policy",
    "הצהרת נגישות": "Accessibility Statement",
    "תנאי שימוש": "Terms of Use"
  };

  // consent text has an inner <a>, so translate the two text-node fragments:
  DICT["אני מאשר/ת קבלת פנייה חוזרת ומסכים/ה"] = "I agree to be contacted and accept the";
  DICT["למדיניות הפרטיות"] = "Privacy Policy";
  DICT["."] = "."; // keep

  var titleMap = {
    "David Balaish Architecture | תכנון אדריכלי, היתרי בנייה ומעטפת מקצועית מלאה":
      "David Balaish Architecture | Architectural Design, Building Permits & Full Professional Envelope"
  };

  var STORAGE = 'dba_lang';
  var nodes = null;         // cached [{node, he, en}]
  var current = 'he';
  var heTitle = document.title;

  function collect() {
    nodes = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('.lang-toggle')) return NodeFilter.FILTER_REJECT;
        var t = n.nodeValue.trim();
        return (t && DICT[t]) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var raw = node.nodeValue;
      var t = raw.trim();
      nodes.push({ node: node, he: raw, en: raw.replace(t, DICT[t]) });
    }
  }

  function apply(lang) {
    if (!nodes) collect();
    var toEn = (lang === 'en');
    nodes.forEach(function (item) { item.node.nodeValue = toEn ? item.en : item.he; });
    document.documentElement.lang = toEn ? 'en' : 'he';
    document.documentElement.dir = toEn ? 'ltr' : 'rtl';
    // title
    var enTitle = titleMap[heTitle];
    document.title = (toEn && enTitle) ? enTitle : heTitle;
    // update toggle label -> always show the OTHER language
    var lbl = document.querySelector('.lang-toggle');
    if (lbl) {
      lbl.textContent = toEn ? 'עב' : 'EN';
      lbl.setAttribute('aria-label', toEn ? 'החלף לעברית' : 'Switch to English');
    }
    current = lang;
    try { localStorage.setItem(STORAGE, lang); } catch (e) {}
  }

  function toggle() { apply(current === 'he' ? 'en' : 'he'); }

  // build the toggle button and drop it into the header + drawer
  function injectButtons() {
    var cta = document.querySelector('.nav-cta');
    if (cta && !cta.querySelector('.lang-toggle')) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang-toggle';
      b.textContent = 'EN';
      b.setAttribute('aria-label', 'Switch to English');
      b.addEventListener('click', toggle);
      cta.insertBefore(b, cta.firstChild);
    }
    var drawer = document.getElementById('drawer');
    if (drawer && !drawer.querySelector('.lang-toggle-drawer')) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'lang-toggle-drawer';
      d.textContent = 'English / עברית';
      d.addEventListener('click', toggle);
      drawer.appendChild(d);
    }
  }

  function init() {
    // language toggle removed from the UI — site stays Hebrew-only.
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
