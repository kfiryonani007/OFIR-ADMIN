/* ============================================================
   Editable site content — one place to change per-page text.

   HOW TO EDIT
   -----------
   • QUOTES       — the wisdom quote shown on each page.
                    Change `text` / `author`, or add a new page key.
   • PAGE_CATEGORY— which portfolio category each page belongs to.
                    Drives the "relevant project" block and the
                    success story shown on that page.

   Both are keyed by the page's filename. A page with no entry
   simply falls back to the DEFAULT below.
   ============================================================ */
window.SITE_CONTENT = {

  /* ---------- wisdom quotes, one per page topic ---------- */
  QUOTES: {
    'index.html': {
      text: 'אדריכלות היא לא על החלל שאתה בונה, אלא על החיים שקורים בתוכו.',
      author: 'עקרון תכנוני'
    },
    'about.html': {
      text: 'תכנון טוב לא נמדד במה שרואים, אלא בכמה קל לחיות בו.',
      author: 'מתוך תפיסת המשרד'
    },
    'services.html': {
      text: 'הפרט הקטן הוא לא פרט קטן, הוא מה שמבדיל בין מבנה לבין בית.',
      author: 'עקרון תכנוני'
    },
    'projects.html': {
      text: 'כל פרויקט מתחיל בשאלה אחת: מה באמת צריך לקרות כאן?',
      author: 'עקרון תכנוני'
    },
    'contact.html': {
      text: 'השיחה הראשונה שווה יותר מעשרה שרטוטים, שם מתברר מה באמת חשוב.',
      author: 'מתוך תפיסת המשרד'
    },
    'service-homes.html': {
      text: 'בית טוב הוא כזה שגדל יחד עם המשפחה שגרה בו.',
      author: 'עקרון תכנוני'
    },
    'service-interior.html': {
      text: 'עיצוב פנים מתחיל בהבנה של איך אנשים באמת זזים בתוך הבית.',
      author: 'עקרון תכנוני'
    },
    'service-permits.html': {
      text: 'רגולציה היא לא מכשול, היא מפת הדרכים. צריך רק לדעת לקרוא אותה.',
      author: 'מתוך תפיסת המשרד'
    },
    'service-pools.html': {
      text: 'בריכה מתוכננת נכון היא המשך של הבית, לא תוספת לחצר.',
      author: 'עקרון תכנוני'
    },
    'service-business.html': {
      text: 'עסק מתוכנן היטב חוסך את מה שלא רואים: זמן, עיכובים ואי-ודאות.',
      author: 'מתוך תפיסת המשרד'
    },
    'service-farms.html': {
      text: 'לפני שמתכננים את הבא, צריך להבין בדיוק מה כבר קיים.',
      author: 'עקרון תכנוני'
    },
    'DEFAULT': {
      text: 'מתכננים נכון בהתחלה, חוסכים תיקונים בסוף.',
      author: 'מתוך תפיסת המשרד'
    }
  },

  /* ---------- which portfolio category belongs to each page ---------- */
  PAGE_CATEGORY: {
    'service-homes.html': 'homes',
    'service-interior.html': 'interior',
    'service-permits.html': 'permits',
    'service-pools.html': 'pools',
    'service-business.html': 'business',
    'service-farms.html': 'farms',
    'project-pool.html': 'pools',
    'project-permits.html': 'permits',
    'project-interior.html': 'interior',
    'project-farm.html': 'farms',
    'project-business.html': 'business'
  }
};
