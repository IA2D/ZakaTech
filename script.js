// =====================
// Local Storage Keys
// =====================
const LS_USERS = "zekaTechUsers";
const LS_THEME = "themeMode";
const LS_LAST_EMAIL = "zekaTechLastEmail"; // For convenience

// =====================
// State
// =====================
let currentUser = null;

let selectedTestKey = null;
let currentTest = null;

let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

let timer = null;
let timeLeft = 300;

// =====================
// Tests (8 علماء) - 6 أسئلة لكل اختبار
// تعليمية/مستوحاة وليست اختبارات رسمية
// =====================
const tests = {
  binet: {
    key: "binet",
    title: "اختبار بينيه (أساسيات)",
    scientist: "Alfred Binet",
    measures: "المفاهيم الأساسية، التمييز، الفهم العام المبسط.",
    minAge: 6,
    maxAge: 10,
    kind: "quiz",
    questions: [
      {
        type: "تمييز",
        q: "أي كلمة مختلفة؟ (تفاح - موز - سيارة)",
        options: ["تفاح", "موز", "سيارة"],
        answer: "سيارة",
      },
      {
        type: "حساب بسيط",
        q: "إذا كان لديك 5 أقلام وأعطيت 2، كم يتبقى؟",
        options: ["2", "3", "4"],
        answer: "3",
      },
      {
        type: "مفاهيم",
        q: "عكس كلمة (كبير) هو:",
        options: ["صغير", "طويل", "سريع"],
        answer: "صغير",
      },
      {
        type: "معرفة عامة",
        q: "كم عدد أيام الأسبوع؟",
        options: ["5", "7", "9"],
        answer: "7",
      },
      {
        type: "علاقة وظيفية",
        q: "الكتاب للقراءة، والقلم لـ:",
        options: ["الكتابة", "الأكل", "القفز"],
        answer: "الكتابة",
      },
      {
        type: "ترتيب",
        q: "رتّب من الأصغر للأكبر: 2، 7، 5",
        options: ["2-5-7", "7-5-2", "5-2-7"],
        answer: "2-5-7",
      },
    ],
  },

  piaget: {
    key: "piaget",
    title: "اختبار بياجيه (نمائي)",
    scientist: "Jean Piaget",
    measures: "التصنيف، العلاقات، منطق مبسط مرتبط بالعمر.",
    minAge: 6,
    maxAge: 12,
    kind: "quiz",
    questions: [
      {
        type: "تصنيف",
        q: "أيهم ينتمي لفئة (حيوانات)؟",
        options: ["قطة", "كرسي", "قلم"],
        answer: "قطة",
      },
      {
        type: "منطق",
        q: "إذا كانت كل الطيور تطير، والحمامة طائر، إذن الحمامة:",
        options: ["تطير", "لا تطير", "لا نعرف"],
        answer: "تطير",
      },
      {
        type: "ترتيب",
        q: "أي ترتيب صحيح للأيام؟",
        options: ["السبت ثم الأحد", "الأحد ثم السبت", "الاثنين ثم الجمعة"],
        answer: "السبت ثم الأحد",
      },
      {
        type: "علاقات",
        q: "العين للرؤية مثل الأذن لـ:",
        options: ["الشم", "السمع", "اللمس"],
        answer: "السمع",
      },
      {
        type: "مقارنة",
        q: "أيهم أكبر؟",
        options: ["10", "8", "6"],
        answer: "10",
      },
      {
        type: "استدلال",
        q: "لو عندك 3 كرات حمراء و2 زرقاء، إجمالي الكرات:",
        options: ["4", "5", "6"],
        answer: "5",
      },
    ],
  },

  terman: {
    key: "terman",
    title: "اختبار تيرمان (ذكاء عام)",
    scientist: "Lewis Terman",
    measures: "استدلال عام ومسائل معيارية مبسطة.",
    minAge: 16,
    maxAge: null,
    kind: "quiz",
    questions: [
      {
        type: "متتالية",
        q: "أكمل: 5، 10، 20، 40، ؟",
        options: ["60", "80", "100"],
        answer: "80",
      },
      {
        type: "نِسَب",
        q: "15% من 200 تساوي:",
        options: ["20", "30", "40"],
        answer: "30",
      },
      {
        type: "مفردات",
        q: "مرادف (دقيق) أقرب إلى:",
        options: ["تفصيلي", "سريع", "ضعيف"],
        answer: "تفصيلي",
      },
      {
        type: "استنتاج",
        q: "إذا كان س=4، فـ 2س+6 =",
        options: ["12", "14", "16"],
        answer: "14",
      },
      {
        type: "منطق",
        q: "كل العلماء باحثون، وبعض الباحثين معلمون. الأدق:",
        options: [
          "كل العلماء معلمون",
          "بعض العلماء قد يكونون معلمين",
          "لا يوجد علماء معلمون",
        ],
        answer: "بعض العلماء قد يكونون معلمين",
      },
      {
        type: "سرعة/مسافة",
        q: "إذا قطع شخص 60 كم في ساعة، فكم يقطع في نصف ساعة؟",
        options: ["20", "30", "40"],
        answer: "30",
      },
    ],
  },

  wechsler: {
    key: "wechsler",
    title: "اختبار وكسلر (لفظي/ذاكرة)",
    scientist: "David Wechsler",
    measures: "مفردات، ذاكرة عاملة، فهم، علاقات لفظية.",
    minAge: 13,
    maxAge: null,
    kind: "quiz",
    questions: [
      {
        type: "مفردات",
        q: "مرادف (سريع) هو:",
        options: ["بطيء", "عاجل", "ثقيل"],
        answer: "عاجل",
      },
      {
        type: "ذاكرة عاملة",
        q: "احفظ الأرقام: 7-2-9 ثم اختر الصحيح:",
        options: ["7-2-9", "7-9-2", "2-7-9"],
        answer: "7-2-9",
      },
      {
        type: "علاقات",
        q: "طبيب : مريض مثل مدرب : ؟",
        options: ["ملعب", "لاعب", "حكم"],
        answer: "لاعب",
      },
      {
        type: "فهم",
        q: "أفضل تصرّف عند حدوث مشكلة مفاجئة:",
        options: ["الانفعال فقط", "تحليل واختيار حل", "تجاهلها دائماً"],
        answer: "تحليل واختيار حل",
      },
      {
        type: "حساب",
        q: "5×6 = 30، إذن 30 ÷ 5 = ?",
        options: ["5", "6", "7"],
        answer: "6",
      },
      {
        type: "تصنيف",
        q: "اختر المختلف: قلم - دفتر - كتاب - سيارة",
        options: ["قلم", "كتاب", "سيارة"],
        answer: "سيارة",
      },
    ],
  },

  spearman: {
    key: "spearman",
    title: "اختبار سبيرمان (عامل g)",
    scientist: "Charles Spearman",
    measures: "استدلال عام، تشابهات، علاقات منطقية.",
    minAge: 11,
    maxAge: null,
    kind: "quiz",
    questions: [
      {
        type: "منطق",
        q: "إذا كانت كل القطط حيوانات، وكل الحيوانات كائنات حية، فالقطط:",
        options: ["كائنات حية", "أشياء", "ليست كائنات حية"],
        answer: "كائنات حية",
      },
      {
        type: "علاقات",
        q: "ليل : قمر مثل نهار : ؟",
        options: ["شمس", "مطر", "ثلج"],
        answer: "شمس",
      },
      {
        type: "استنتاج",
        q: "أي عدد أولي؟",
        options: ["9", "11", "15"],
        answer: "11",
      },
      {
        type: "أنماط",
        q: "أكمل: 2، 4، 8، 16، ؟",
        options: ["18", "24", "32"],
        answer: "32",
      },
      {
        type: "تصنيف",
        q: "اختر المختلف: مثلث - مربع - دائرة - موز",
        options: ["مثلث", "دائرة", "موز"],
        answer: "موز",
      },
      {
        type: "تشابه",
        q: "ما الأكثر تشابهًا مع (كتاب)؟",
        options: ["قلم", "دفتر", "سيارة"],
        answer: "دفتر",
      },
    ],
  },

  cattell: {
    key: "cattell",
    title: "اختبار كاتل (الذكاء السائل)",
    scientist: "Raymond Cattell",
    measures: "أنماط وتجريد واستنتاج غير لفظي.",
    minAge: 14,
    maxAge: null,
    kind: "quiz",
    questions: [
      {
        type: "أنماط",
        q: "أكمل: 1، 4، 9، 16، ؟",
        options: ["20", "25", "36"],
        answer: "25",
      },
      {
        type: "نمط رمزي",
        q: "أكمل النمط: ▲، ▲▲، ▲▲▲، ؟",
        options: ["▲▲▲▲", "▲▲", "▲"],
        answer: "▲▲▲▲",
      },
      {
        type: "استدلال",
        q: "إذا كان A > B و B > C إذن:",
        options: ["C > A", "A > C", "A = C"],
        answer: "A > C",
      },
      {
        type: "أنماط",
        q: "أكمل: 3، 6، 12، 24، ؟",
        options: ["30", "36", "48"],
        answer: "48",
      },
      {
        type: "تجريد",
        q: "أي شكل يدل على تنظيم هرمي أكثر؟",
        options: ["دائرة", "هرم", "خط عشوائي"],
        answer: "هرم",
      },
      {
        type: "تطابق",
        q: "أي زوج متطابق تمامًا؟",
        options: ["AB12 / AB21", "ZX90 / ZX90", "QW33 / QW3"],
        answer: "ZX90 / ZX90",
      },
    ],
  },

  sternberg: {
    key: "sternberg",
    title: "اختبار ستيرنبرغ (ثلاثي)",
    scientist: "Robert Sternberg",
    measures: "تحليلي + عملي + إبداعي (مواقف مبسطة).",
    minAge: 15,
    maxAge: null,
    kind: "quiz",
    questions: [
      {
        type: "تحليلي",
        q: "أفضل طريقة لحل مسألة معقدة:",
        options: ["تقسيمها لخطوات", "تجاهل المعطيات", "الاعتماد على الحظ"],
        answer: "تقسيمها لخطوات",
      },
      {
        type: "عملي",
        q: "لو جهازك لا يعمل قبل تسليم مهمة، الأفضل:",
        options: ["الاستسلام", "البحث عن حل/بديل", "عدم إبلاغ أحد"],
        answer: "البحث عن حل/بديل",
      },
      {
        type: "إبداعي",
        q: "أقرب معنى للإبداع هنا:",
        options: ["نسخ نفس الحل", "ابتكار حل جديد", "رفض أي حل"],
        answer: "ابتكار حل جديد",
      },
      {
        type: "منطق",
        q: "إذا كان كل A هو B، وبعض B هو C، الأدق:",
        options: ["كل A هو C", "بعض A قد يكون C", "لا يوجد C"],
        answer: "بعض A قد يكون C",
      },
      {
        type: "عملي",
        q: "أثناء العمل الجماعي، الأفضل:",
        options: ["توزيع المهام حسب القوة", "كل شيء لشخص واحد", "لا تخطيط"],
        answer: "توزيع المهام حسب القوة",
      },
      {
        type: "إبداعي",
        q: "لاختيار فكرة مشروع جديدة، الأفضل:",
        options: [
          "جمع أفكار كثيرة ثم اختيار الأفضل",
          "فكرة واحدة فقط",
          "عدم التفكير",
        ],
        answer: "جمع أفكار كثيرة ثم اختيار الأفضل",
      },
    ],
  },

  gardner: {
    key: "gardner",
    title: "اختبار جاردنر (الذكاءات المتعددة)",
    scientist: "Howard Gardner",
    measures: "تحديد نمط الذكاءات الأقرب لك.",
    minAge: 10,
    maxAge: null,
    kind: "inventory",
    questions: [
      { dim: "الذكاء اللغوي", q: "أحب القراءة والكتابة والتعبير بالكلمات." },
      { dim: "الذكاء المنطقي", q: "أستمتع بحل الألغاز والمسائل المنطقية." },
      { dim: "الذكاء البصري", q: "أفكر بالصور والأشكال والألوان بسهولة." },
      { dim: "الذكاء الاجتماعي", q: "أفهم الآخرين وأتواصل معهم بسهولة." },
      { dim: "الذكاء الذاتي", q: "أعرف نقاط قوتي وضعفي وأحدد أهدافي." },
      { dim: "الذكاء اللغوي", q: "أستطيع شرح فكرة معقدة بكلمات بسيطة." },
    ],
  },
};

// =====================
// Utilities
// =====================
async function sha256(message) {
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttr(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidFullName(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length >= 4;
}

function generateUserId(existingUsers) {
  for (let i = 0; i < 20; i++) {
    const code = "ZT-" + Math.floor(100000 + Math.random() * 900000);
    if (!existingUsers.some((u) => u.userId === code)) return code;
  }
  return "ZT-" + Date.now().toString().slice(-6);
}

async function sha256(text) {
  try {
    if (!window.crypto?.subtle) throw new Error("no subtle");
    const enc = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i);
    return "fx-" + (h >>> 0).toString(16);
  }
}

function levelFromPercentage(p) {
  if (p >= 80) return "ممتاز";
  if (p >= 60) return "جيد";
  if (p >= 40) return "مقبول";
  return "يحتاج إلى تدريب";
}
function levelClass(level) {
  if (level === "ممتاز") return "excellent";
  if (level === "جيد") return "good";
  if (level === "مقبول") return "average";
  return "low";
}

function getAgeRangeText(t) {
  const min = t.minAge ?? "-";
  const max = t.maxAge ?? "أكثر";
  return `${min} إلى ${max}`;
}
function isTestAvailableForAge(test, age) {
  if (!Number.isFinite(age)) return false;
  if (test.minAge != null && age < test.minAge) return false;
  if (test.maxAge != null && age > test.maxAge) return false;
  return true;
}

function getLevelDescriptor(level) {
  if (level === "ممتاز") {
    return {
      meaning:
        "يدل على أداء قوي جدًا في المهارات التي يقيسها الاختبار (فهم العلاقات/حل المشكلات/الاستنتاج) حسب نوع الاختبار.",
      recommendations:
        "استمر على تمارين أعلى مستوى (ألغاز منطقية، مسائل أنماط، قراءة تحليلية) وجرّب اختبارات أخرى لتوسيع مهاراتك.",
    };
  }
  if (level === "جيد") {
    return {
      meaning:
        "يدل على مستوى جيد مع وجود أساس قوي، لكن ما زالت هناك نقاط يمكن تحسينها للوصول للأداء الممتاز.",
      recommendations:
        "ركز على نوع الأسئلة التي أخطأت فيها، وكرّر التدريب 10 دقائق يوميًا (أنماط/منطق/مفردات).",
    };
  }
  if (level === "مقبول") {
    return {
      meaning:
        "يدل على مستوى متوسط: لديك بعض المهارات الجيدة لكن تحتاج ثباتًا أكثر وفهمًا أعمق في بعض الأنواع.",
      recommendations:
        "ابدأ بتدريبات أبسط ثم تدرّج. راجع الأسئلة الخاطئة واعرف سبب الخطأ (سرعة/تشتت/فهم السؤال).",
    };
  }
  return {
    meaning:
      "يدل على الحاجة لتدريب أكبر في المهارات الأساسية للاختبار (التركيز، فهم العلاقات، حل المشكلات).",
    recommendations:
      "ابدأ بخطوات صغيرة: 5–10 دقائق يوميًا تدريب على نفس نوع الأسئلة، ثم أعد الاختبار لملاحظة التحسن.",
  };
}

function buildRangeMeaningTable() {
  const ranges = [
    { from: 0, to: 39, level: "يحتاج إلى تدريب" },
    { from: 40, to: 59, level: "مقبول" },
    { from: 60, to: 79, level: "جيد" },
    { from: 80, to: 100, level: "ممتاز" },
  ];

  return `
    <table class="meaning-table">
      <thead>
        <tr>
          <th>النطاق</th>
          <th>المستوى</th>
          <th>يدل على</th>
        </tr>
      </thead>
      <tbody>
        ${ranges
          .map((r) => {
            const desc = getLevelDescriptor(r.level);
            return `
              <tr>
                <td>${r.from}–${r.to}%</td>
                <td><span class="meaning-pill ${levelClass(r.level)}">${r.level}</span></td>
                <td>${escapeHtml(desc.meaning)}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function buildRawScoreMeaningTable(totalQuestions) {
  const rows = [];
  for (let s = 0; s <= totalQuestions; s++) {
    const perc = Math.round((s / totalQuestions) * 100);
    const lvl = levelFromPercentage(perc);
    const desc = getLevelDescriptor(lvl);
    rows.push({ s, perc, lvl, meaning: desc.meaning });
  }

  return `
    <table class="meaning-table">
      <thead>
        <tr>
          <th>درجتك</th>
          <th>النسبة</th>
          <th>المستوى</th>
          <th>يدل على</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `
          <tr>
            <td>${r.s}/${totalQuestions}</td>
            <td>${r.perc}%</td>
            <td><span class="meaning-pill ${levelClass(r.lvl)}">${r.lvl}</span></td>
            <td>${escapeHtml(r.meaning)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

// =====================
// Print Functions
// =====================
function printCertificate() {
  // Get the certificate HTML
  const certBox = document.getElementById('certificateBox');
  if (!certBox) return;

  const certHTML = certBox.innerHTML;

  // Create a new window with only the certificate
  const printWindow = window.open('', '_blank', 'width=1200,height=800');

  printWindow.document.write(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>شهادة إتمام - ذكاء تك</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Cairo', sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .cert-wrapper {
      width: 100%;
      max-width: 1000px;
    }

    .certificate {
      background: linear-gradient(145deg, #fff9e6 0%, #fffef9 100%);
      border: 4px solid #f1c15d;
      border-radius: 30px;
      padding: 50px 60px;
      text-align: center;
      color: #5a3a00;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    }

    .certificate h2 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #8a5c00;
    }

    .certificate .name {
      font-size: 2.2rem;
      font-weight: 900;
      color: #8a5c00;
      margin: 20px 0;
    }

    .certificate p {
      font-size: 1.2rem;
      margin: 12px 0;
      line-height: 1.8;
    }

    .certificate strong {
      color: #8a5c00;
    }

    .stamp {
      width: 150px;
      height: 150px;
      margin: 30px auto 0;
      border-radius: 50%;
      border: 4px dashed #d62828;
      display: grid;
      place-items: center;
      color: #d62828;
      font-weight: 900;
      font-size: 1.1rem;
      transform: rotate(-10deg);
    }

    .actions-center {
      margin-top: 30px;
    }

    .btn {
      padding: 12px 30px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-family: 'Cairo', sans-serif;
      font-size: 1rem;
      font-weight: 700;
    }

    .btn-gold {
      background: linear-gradient(135deg, #f1c15d, #e6a93c);
      color: #5a3a00;
    }

    .btn-gold:hover {
      background: linear-gradient(135deg, #e6a93c, #d4942a);
    }

    /* Print styles - full page */
    @media print {
      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        background: white;
        padding: 0;
        margin: 0;
      }

      .cert-wrapper {
        width: 100vw;
        height: 100vh;
        max-width: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .certificate {
        width: 100%;
        height: 100%;
        max-width: none;
        border-radius: 0;
        /* Border is inherited from regular styles */
        box-shadow: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        page-break-after: avoid;
        margin: 0;
      }

      .actions-center {
        display: none;
      }
    }
  </style>
  <script>
    /* Keyboard shortcut for print */
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });
  </script>
</head>
<body>
  <div class="cert-wrapper">
    ${certHTML.replace(/onclick="[^"]*"/g, '').replace(/class="btn btn-gold"/, 'class="btn btn-gold" onclick="window.print()"').replace(/>فتح الشهادة للطباعة ↗</, '>طباعة 🖨️<')}
  </div>
  <script>
    // Auto-focus and show print hint
    window.onload = () => {
      document.title = 'اضغط Ctrl+P للطباعة | ذكاء تك';
    };
  </script>
</body>
</html>
  `);

  printWindow.document.close();
}

function printResult() {
  // Add result-only class
  document.body.classList.add('printing-result');
  document.body.classList.remove('printing-certificate');

  // Wait for class to apply then print
  setTimeout(() => {
    window.print();
    // Remove class after printing
    setTimeout(() => {
      document.body.classList.remove('printing-result');
    }, 100);
  }, 100);
}

// =====================
// Theme + Reveal + Init
// =====================
window.addEventListener("load", async () => {
  setTimeout(
    () => document.getElementById("splash")?.classList.add("hide"),
    900,
  );

  loadTheme();
  initReveal();

  // Wait for session to load before updating UI
  await loadSessionFromStorage();
  prefillLastUserId();
  initBrain3D();

  refreshSessionUI();
  updateBrainAvailability();
  renderHistory();
});

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach(
        (e) => e.isIntersecting && e.target.classList.add("active"),
      ),
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

const themeToggle = document.getElementById("themeToggle");
themeToggle?.addEventListener("click", toggleTheme);

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem(LS_THEME, isLight ? "light" : "dark");
  if (themeToggle) themeToggle.textContent = isLight ? "☀️" : "🌙";
}

function loadTheme() {
  const savedTheme = localStorage.getItem(LS_THEME);
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    if (themeToggle) themeToggle.textContent = "🌙";
  }
}

// =====================
// Auth (API Backend)
// =====================
async function loadSessionFromStorage() {
  // Check if we have a token
  if (!api.isAuthenticated()) {
    currentUser = null;
    return;
  }

  try {
    const user = await api.getCurrentUser();
    currentUser = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      age: user.age,
      gender: user.gender,
      stage: user.stage,
      isAdmin: user.isAdmin
    };
  } catch (error) {
    console.error('Failed to load session:', error);
    api.logout();
    currentUser = null;
  }
}

// NEW: تعبئة تلقائية لآخر بريد إلكتروني
function prefillLastUserId() {
  if (currentUser) return;
  const last = localStorage.getItem(LS_LAST_EMAIL);
  const loginEmailInput = document.getElementById("loginEmail");
  if (last && loginEmailInput && !loginEmailInput.value) {
    loginEmailInput.value = last;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function registerUser() {
  const fullName = document.getElementById("regFullName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const age = parseInt(document.getElementById("regAge").value.trim());
  const gender = document.getElementById("regGender").value.trim();
  const stage = document.getElementById("regStage").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  const msg = document.getElementById("registerMsg");
  msg.textContent = "";

  try {
    if (!isValidFullName(fullName))
      throw new Error("الاسم يجب أن يكون رباعي (4 كلمات على الأقل).");
    if (!isValidEmail(email))
      throw new Error("البريد الإلكتروني غير صالح.");
    if (!Number.isFinite(age) || age < 6 || age > 90)
      throw new Error("العمر غير صالح (يجب بين 6 و 90).");
    if (!gender || !stage) throw new Error("أكمل جميع البيانات.");
    if (!password || password.length < 6)
      throw new Error("كلمة المرور يجب ألا تقل عن 6 أحرف/أرقام.");

    // Register via API
    const data = await api.register({
      email,
      password,
      fullName,
      age,
      gender,
      stage
    });

    // Save last email for convenience
    localStorage.setItem(LS_LAST_EMAIL, email);

    // Update current user
    currentUser = {
      userId: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      age: data.user.age,
      gender: data.user.gender,
      stage: data.user.stage
    };

    msg.style.color = "var(--success)";
    msg.textContent = `تم إنشاء الحساب بنجاح! مرحباً ${fullName}`;

    onLoginSuccess();
  } catch (e) {
    msg.style.color = "var(--danger)";
    msg.textContent = e.message || "حدث خطأ أثناء التسجيل";
  }
}

async function loginUser() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  const msg = document.getElementById("loginMsg");
  msg.textContent = "";

  try {
    if (!email || !password) throw new Error("أدخل البريد الإلكتروني وكلمة المرور.");

    // Login via API
    const data = await api.login({ email, password });

    // Update current user
    currentUser = {
      userId: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      age: data.user.age,
      gender: data.user.gender,
      stage: data.user.stage,
      isAdmin: data.user.isAdmin
    };

    // Save last email for convenience
    localStorage.setItem(LS_LAST_EMAIL, email);

    msg.style.color = "var(--success)";
    msg.textContent = `مرحباً ${data.user.fullName}! تم تسجيل الدخول بنجاح.`;

    onLoginSuccess();
  } catch (e) {
    msg.style.color = "var(--danger)";
    msg.textContent = e.message;
  }
}

function logoutUser() {
  // Logout from API
  api.logout();
  currentUser = null;

  // تحديث الواجهة
  const welcomeBox = document.getElementById("welcomeBox");
  welcomeBox.classList.add("hidden");
  welcomeBox.innerHTML = "";

  refreshSessionUI();
  updateBrainAvailability();
  renderHistory();

  // الانتقال لأعلى الصفحة وإظهار رسالة
  document.getElementById("user").scrollIntoView({ behavior: "smooth" });

  const loginMsg = document.getElementById("loginMsg");
  loginMsg.style.color = "var(--success)";
  loginMsg.textContent = "تم تسجيل الخروج بنجاح.";

  // NEW: Clear fields and prefill last email
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  prefillLastUserId();
}

function onLoginSuccess() {
  const welcomeBox = document.getElementById("welcomeBox");
  welcomeBox.classList.remove("hidden");
  welcomeBox.innerHTML = `
    <strong>مرحباً ${escapeHtml(currentUser.fullName)}</strong><br>
    البريد: <strong>${escapeHtml(currentUser.email)}</strong><br>
    العمر: <strong>${escapeHtml(currentUser.age)}</strong> — تم تفعيل الاختبارات المناسبة.
  `;

  refreshSessionUI();
  updateBrainAvailability();
  renderHistory();

  document.getElementById("tests").scrollIntoView({ behavior: "smooth" });
}

function refreshSessionUI() {
  const box = document.getElementById("sessionMini");
  if (box) {
    if (currentUser) {
      box.classList.remove("hidden");
      box.innerHTML = `
        <strong>جلسة نشطة:</strong> ${escapeHtml(currentUser.fullName)}<br>
        <small>${escapeHtml(currentUser.email)}</small><br>
        يمكنك البدء من قسم الاختبارات.
      `;
    } else {
      box.classList.add("hidden");
    }
  }

  // Update navbar auth state
  const navGuest = document.getElementById("navGuest");
  const navUser = document.getElementById("navUser");
  const navUserName = document.getElementById("navUserName");
  const navAdminBadge = document.getElementById("navAdminBadge");
  const adminNavLink = document.getElementById("adminNavLink");
  const testsLockMsg = document.getElementById("testsLockMsg");

  if (currentUser) {
    // Show user info in navbar
    if (navGuest) navGuest.classList.add("hidden");
    if (navUser) {
      navUser.classList.remove("hidden");
      navUserName.textContent = currentUser.fullName;
    }

    // Show admin badge and admin link if admin
    if (currentUser.isAdmin) {
      if (navAdminBadge) navAdminBadge.classList.remove("hidden");
      if (adminNavLink) adminNavLink.classList.remove("hidden");
    } else {
      if (navAdminBadge) navAdminBadge.classList.add("hidden");
      if (adminNavLink) adminNavLink.classList.add("hidden");
    }

    // Update tests lock message
    if (testsLockMsg) {
      testsLockMsg.innerHTML = `أهلاً <strong>${escapeHtml(currentUser.fullName)}</strong>. اضغط على جزء من المخ لاختيار اختبار.`;
    }
  } else {
    // Show guest buttons in navbar
    if (navGuest) navGuest.classList.remove("hidden");
    if (navUser) navUser.classList.add("hidden");
    if (navAdminBadge) navAdminBadge.classList.add("hidden");
    if (adminNavLink) adminNavLink.classList.add("hidden");

    // Update tests lock message
    if (testsLockMsg) {
      testsLockMsg.innerHTML = `سجّل دخول أولاً لتفعيل الاختبارات.`;
    }
  }
}

// =====================
// 3D Brain using GLTF Model
// =====================
let scene, camera, renderer, controls, raycaster;
let brainModel = null;
let brainRegions = [];
let pointer = new THREE.Vector2();
let hoveredRegion = null;
let selectedRegion = null;

// Region colors mapping - darker, less vibrant
const regionColors = {
  "binet": 0x2a7a99,    // Darker cyan
  "piaget": 0x5a4fb5,   // Darker purple
  "terman": 0xc99120,   // Darker gold
  "wechsler": 0x0d8a5f, // Darker green
  "spearman": 0x1a4191, // Darker blue
  "cattell": 0xb91c1c,  // Darker red
  "sternberg": 0x7c3aed,// Darker violet
  "gardner": 0xc2410c   // Darker orange
};

// Region positions for camera targeting (normalized coordinates)
const regionTargets = {
  "binet": { x: -0.8, y: 1.0, z: 0.5, camX: -2, camY: 2, camZ: 4 },
  "piaget": { x: -0.5, y: 0.3, z: 0.8, camX: -1.5, camY: 1, camZ: 4.5 },
  "terman": { x: 0.8, y: 1.0, z: 0.5, camX: 2, camY: 2, camZ: 4 },
  "wechsler": { x: 0.5, y: 0.3, z: 0.8, camX: 1.5, camY: 1, camZ: 4.5 },
  "spearman": { x: -0.9, y: -0.3, z: 0.2, camX: -2, camY: -0.5, camZ: 4 },
  "cattell": { x: -0.6, y: -0.8, z: 0.0, camX: -1.5, camY: -1.5, camZ: 4 },
  "sternberg": { x: 0.9, y: -0.3, z: 0.2, camX: 2, camY: -0.5, camZ: 4 },
  "gardner": { x: 0.6, y: -0.8, z: 0.0, camX: 1.5, camY: -1.5, camZ: 4 }
};

function initBrain3D() {
  const canvas = document.getElementById("brainCanvas");
  if (!canvas || !window.THREE || !window.THREE.GLTFLoader) return;

  try {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = null;

    // Camera
    const parent = canvas.parentElement;
    camera = new THREE.PerspectiveCamera(45, parent.clientWidth / parent.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Renderer
    // Detect mobile for performance optimization
    const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || window.innerWidth < 768;

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,  // Disable antialias on mobile
      alpha: true,
      powerPreference: isMobile ? "low-power" : "high-performance"
    });
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isMobile;  // Disable shadows on mobile
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Controls
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.5;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 3;
    controls.maxDistance = 8;

    // Raycaster
    raycaster = new THREE.Raycaster();

    // Darker, moodier lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xa0a0a0, 0.8);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = !isMobile;  // No shadows on mobile
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x505060, 0.3);
    fillLight.position.set(-5, 0, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x3ecbff, 0.3);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Load GLTF Model
    const loader = new THREE.GLTFLoader();
    loader.load(
      'model/scene.gltf',
      function (gltf) {
        brainModel = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(brainModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;

        brainModel.scale.set(scale, scale, scale);
        brainModel.position.sub(center.multiplyScalar(scale));
        brainModel.position.y += 0.2;

        // Traverse and setup materials/interactions
        brainModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Store original material for hover effects
            child.userData.originalMaterial = child.material.clone();

            // Make material emissive-capable for hover
            if (child.material) {
              child.material = child.material.clone();
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
            }

            // Check if mesh name matches any region
            const meshName = child.name.toLowerCase();
            for (const [key, color] of Object.entries(regionColors)) {
              if (meshName.includes(key)) {
                child.userData.testKey = key;
                child.userData.regionColor = color;
                brainRegions.push(child);
                break;
              }
            }
          }
        });

        // If no regions found by name, create 8 interactive zones based on position
        if (brainRegions.length === 0) {
          createRegionZones(brainModel, scale);
        }

        scene.add(brainModel);
        updateBrainAvailability();
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
        console.error('Error loading model:', error);
      }
    );

    // Resize handler
    function onResize() {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // Mouse interactions - hover only, no click
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseenter", () => { controls.autoRotate = false; });
    canvas.addEventListener("mouseleave", () => {
      controls.autoRotate = true;
      if (hoveredRegion) {
        resetRegion(hoveredRegion);
        hoveredRegion = null;
      }
      unhighlightLabels();
    });

    // Touch interactions - allow rotation only, no tap selection
    canvas.addEventListener("touchstart", (e) => {
      controls.autoRotate = false;
    }, { passive: true });
    canvas.addEventListener("touchend", () => {
      setTimeout(() => { controls.autoRotate = true; }, 1000);
    }, { passive: true });

    function onMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(brainRegions);

      if (intersects.length > 0) {
        const region = intersects[0].object;
        if (hoveredRegion !== region) {
          if (hoveredRegion) resetRegion(hoveredRegion);
          hoveredRegion = region;
          highlightRegion(region);
          canvas.style.cursor = "pointer";
          highlightLabel(region.userData.testKey);
        }
      } else {
        if (hoveredRegion) {
          resetRegion(hoveredRegion);
          hoveredRegion = null;
          canvas.style.cursor = "grab";
          unhighlightLabels();
        }
      }
    }


    // Track popup hide timeout and current key
    let popupHideTimeout = null;
    let currentPopupKey = null;

    // Label handlers - show popup on hover/click
    document.querySelectorAll('.brain-label').forEach(label => {
      // Mouse enter - show popup and highlight
      label.addEventListener('mouseenter', (e) => {
        const key = label.dataset.region;
        const region = brainRegions.find(r => r.userData.testKey === key);
        if (region) {
          // Clear any pending hide
          if (popupHideTimeout) {
            clearTimeout(popupHideTimeout);
            popupHideTimeout = null;
          }
          currentPopupKey = key;
          highlightLabel(key);
          highlightRegion(region);
          rotateToRegion(key);
          showRegionPopup(key);
        }
      });

      // Mouse leave - only hide after delay, not immediately
      label.addEventListener('mouseleave', (e) => {
        const key = label.dataset.region;
        const region = brainRegions.find(r => r.userData.testKey === key);
        // Clear any existing timeout first
        if (popupHideTimeout) {
          clearTimeout(popupHideTimeout);
        }
        // Delayed hide - check if mouse moved to popup or stayed on label area
        popupHideTimeout = setTimeout(() => {
          const popup = document.getElementById('regionPopup');
          // Only hide if mouse is not over the popup
          if (popup && !popup.matches(':hover')) {
            if (region && region !== selectedRegion) {
              unhighlightLabels();
              resetRegion(region);
            }
            hideRegionPopup();
            currentPopupKey = null;
          }
        }, 300);
      });

      // Click also shows popup (for accessibility)
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = label.dataset.region;
        currentPopupKey = key;
        selectRegion(key);
        rotateToRegion(key);
        showRegionPopup(key);
      });

      // Touch support for mobile
      label.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const key = label.dataset.region;
        currentPopupKey = key;
        selectRegion(key);
        rotateToRegion(key);
        showRegionPopup(key);
      }, { passive: false });
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

  } catch (e) {
    console.error("Brain 3D initialization error:", e);
  }
}

function createRegionZones(model, scale) {
  // Create 8 invisible spheres as interaction zones
  const zones = [
    { key: "binet", pos: [-0.8, 1.0, 0.5] },
    { key: "piaget", pos: [-0.5, 0.3, 0.8] },
    { key: "terman", pos: [0.8, 1.0, 0.5] },
    { key: "wechsler", pos: [0.5, 0.3, 0.8] },
    { key: "spearman", pos: [-0.9, -0.3, 0.2] },
    { key: "cattell", pos: [-0.6, -0.8, 0.0] },
    { key: "sternberg", pos: [0.9, -0.3, 0.2] },
    { key: "gardner", pos: [0.6, -0.8, 0.0] }
  ];

  zones.forEach(zone => {
    const geometry = new THREE.SphereGeometry(0.4, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: regionColors[zone.key],
      transparent: true,
      opacity: 0.0,
      visible: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...zone.pos);
    mesh.userData.testKey = zone.key;
    mesh.userData.regionColor = regionColors[zone.key];
    mesh.userData.isZone = true;
    model.add(mesh);
    brainRegions.push(mesh);
  });
}

function highlightRegion(mesh) {
  if (!mesh.userData.regionColor) return;

  const color = new THREE.Color(mesh.userData.regionColor);
  mesh.material.emissive = color;
  mesh.material.emissiveIntensity = 0.4;

  // Slight scale up
  if (!mesh.userData.isZone) {
    mesh.scale.setScalar(1.05);
  }
}

function resetRegion(mesh) {
  mesh.material.emissiveIntensity = 0;
  if (!mesh.userData.isZone) {
    mesh.scale.setScalar(1.0);
  }
}

function rotateToRegion(key) {
  if (!controls || !regionTargets[key]) return;

  const target = regionTargets[key];
  const duration = 1000; // ms
  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(target.camX, target.camY, target.camZ);
  const startTarget = controls.target.clone();
  const endTarget = new THREE.Vector3(target.x, target.y, target.z);
  const startTime = performance.now();

  // Stop auto rotation during animation
  controls.autoRotate = false;

  function animateCamera() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(startPos, endPos, ease);
    controls.target.lerpVectors(startTarget, endTarget, ease);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    }
  }
  animateCamera();
}

function showRegionPopup(key) {
  const t = tests[key];
  if (!t) return;

  // Check if popup already exists for this key
  const existingPopup = document.getElementById('regionPopup');
  if (existingPopup && existingPopup.dataset.key === key) {
    return; // Already showing this popup
  }

  // Hide any existing popup
  hideRegionPopup();

  const popup = document.createElement('div');
  popup.id = 'regionPopup';
  popup.dataset.key = key;
  popup.className = 'region-popup';
  popup.innerHTML = `
    <div class="popup-arrow"></div>
    <div class="popup-header">
      <div class="popup-color" style="background: #${regionColors[key].toString(16).padStart(6, '0')}"></div>
      <div class="popup-title">
        <h4>${t.scientist}</h4>
        <span>${t.title}</span>
      </div>
      <button class="popup-close" onclick="hideRegionPopup()">×</button>
    </div>
    <div class="popup-body">
      <p><strong>يقيس:</strong> ${t.measures}</p>
      <p><strong>الفئة العمرية:</strong> ${getAgeRangeText(t)}</p>
    </div>
    <div class="popup-actions">
      <button class="btn btn-primary" onclick="startTest('${key}'); hideRegionPopup();">
        ابدأ الاختبار
      </button>
    </div>
  `;

  // Position inside brain3d-wrap
  const brainWrap = document.querySelector('.brain3d-wrap');
  if (brainWrap) {
    brainWrap.appendChild(popup);

    // Position at top-left of the brain viewport
    popup.style.position = 'absolute';
    popup.style.left = '16px';
    popup.style.top = '16px';
    popup.style.transform = 'none';
  } else {
    document.body.appendChild(popup);
    popup.style.position = 'fixed';
    popup.style.left = '16px';
    popup.style.top = '16px';
    popup.style.transform = 'none';
  }

  // Keep popup open when hovering over it
  popup.addEventListener('mouseenter', () => {
    // Keep open
  });
  popup.addEventListener('mouseleave', () => {
    hideRegionPopup();
    unhighlightLabels();
    brainRegions.forEach(r => resetRegion(r));
  });
}

function hideRegionPopup() {
  const popup = document.getElementById('regionPopup');
  if (popup) {
    popup.remove();
  }
}

function selectRegion(key) {
  selectedRegion = key;
  brainRegions.forEach((region) => {
    const isSelected = region.userData.testKey === key;
    if (isSelected) {
      const color = new THREE.Color(region.userData.regionColor);
      region.material.emissive = color;
      region.material.emissiveIntensity = 0.6;
      if (!region.userData.isZone) {
        region.scale.setScalar(1.08);
      }
    } else {
      region.material.emissiveIntensity = 0;
      if (!region.userData.isZone) {
        region.scale.setScalar(1.0);
      }
    }
  });
  highlightLabel(key);
}

function highlightLabel(key) {
  const labels = document.querySelectorAll('.brain-label');
  labels.forEach((label) => {
    if (label.dataset.region === key) {
      label.classList.add('active');
    } else {
      label.classList.remove('active');
    }
  });
}

function unhighlightLabels() {
  const labels = document.querySelectorAll('.brain-label');
  labels.forEach((label) => {
    label.classList.remove('active');
  });
}

function updateBrainAvailability() {
  if (!brainRegions?.length || !brainModel) return;
  const age = currentUser ? parseInt(currentUser.age) : NaN;

  brainRegions.forEach((mesh) => {
    const testKey = mesh.userData.testKey;
    const t = tests[testKey];
    const allowed = currentUser && isTestAvailableForAge(t, age);

    if (mesh.userData.isZone) {
      // For zone meshes, just update visibility
      mesh.visible = allowed;
    } else {
      // For actual model meshes
      if (allowed) {
        mesh.material.opacity = 1.0;
        mesh.visible = true;
      } else {
        mesh.visible = false;
      }
    }
  });

  // Update labels
  const labels = document.querySelectorAll('.brain-label');
  labels.forEach((label) => {
    const key = label.dataset.region;
    const t = tests[key];
    const allowed = currentUser && isTestAvailableForAge(t, age);
    label.style.opacity = allowed ? '1' : '0.3';
    label.style.pointerEvents = allowed ? 'auto' : 'none';
  });
}

function onPickTestFromBrain(testKey) {
  const card = document.getElementById("selectedTestCard");

  if (!currentUser) {
    card.classList.add("hidden");
    alert("سجّل دخول أولاً من قسم بيانات المستخدم.");
    document.getElementById("user").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const age = parseInt(currentUser.age);
  const t = tests[testKey];

  if (!isTestAvailableForAge(t, age)) {
    alert(`هذا الاختبار غير متاح لعُمرك. الفئة العمرية: ${getAgeRangeText(t)}`);
    return;
  }

  selectedTestKey = testKey;
  document.getElementById("selTestScientist").textContent = t.scientist;
  document.getElementById("selTestName").textContent = t.title;
  document.getElementById("selTestMeasures").textContent = t.measures;
  document.getElementById("selTestAge").textContent = getAgeRangeText(t);

  card.classList.remove("hidden");
}

function startSelectedTest() {
  if (!selectedTestKey) return;
  startTest(selectedTestKey);
}

// =====================
// Test Engine
// =====================
function startTest(testKey) {
  currentTest = tests[testKey];
  if (!currentTest) return;

  currentQuestionIndex = 0;
  currentQuestions = currentTest.questions;
  userAnswers = new Array(currentQuestions.length).fill(null);

  document.getElementById("testNameLabel").textContent = currentTest.title;
  document.getElementById("testMeasureLabel").textContent =
    currentTest.measures;
  document.getElementById("testScientistLabel").textContent =
    currentTest.scientist;

  document.getElementById("testArea").classList.remove("hidden");
  renderQuestion();
  updateProgress();
  startTimer();

  document.getElementById("testArea").scrollIntoView({ behavior: "smooth" });
}

function renderQuestion() {
  const container = document.getElementById("singleQuestionContainer");
  const totalCount = currentQuestions.length;

  document.getElementById("questionCounter").textContent =
    `السؤال ${currentQuestionIndex + 1} من ${totalCount}`;

  if (currentTest.kind === "quiz") {
    const q = currentQuestions[currentQuestionIndex];

    container.innerHTML = `
      <div class="question-card">
        <div class="question-head">
          <span>العالم: ${escapeHtml(currentTest.scientist)}</span>
          <span>نوع السؤال: ${escapeHtml(q.type)}</span>
        </div>

        <h4>${escapeHtml(q.q)}</h4>

        <div class="options">
          ${q.options
            .map((option) => {
              const checked =
                userAnswers[currentQuestionIndex] === option ? "checked" : "";
              return `
                <label class="option">
                  <input
                    type="radio"
                    name="currentQuestion"
                    value="${escapeHtmlAttr(option)}"
                    ${checked}
                    onchange="saveCurrentAnswer(this.value)"
                  >
                  <span>${escapeHtml(option)}</span>
                </label>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  } else {
    const item = currentQuestions[currentQuestionIndex];

    container.innerHTML = `
      <div class="question-card">
        <div class="question-head">
          <span>العالم: ${escapeHtml(currentTest.scientist)}</span>
          <span>${escapeHtml(item.dim)}</span>
        </div>

        <h4>${escapeHtml(item.q)}</h4>

        <div class="options">
          ${[
            { v: 3, label: "نعم بدرجة كبيرة" },
            { v: 2, label: "إلى حد ما" },
            { v: 1, label: "نادرًا" },
          ]
            .map(({ v, label }) => {
              const checked =
                userAnswers[currentQuestionIndex] === v ? "checked" : "";
              return `
                <label class="option">
                  <input
                    type="radio"
                    name="currentQuestion"
                    value="${v}"
                    ${checked}
                    onchange="saveCurrentAnswer(parseInt(this.value))"
                  >
                  <span>${label}</span>
                </label>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;

  if (currentQuestionIndex === totalCount - 1) {
    document.getElementById("nextBtn").classList.add("hidden");
    document.getElementById("finishBtn").classList.remove("hidden");
  } else {
    document.getElementById("nextBtn").classList.remove("hidden");
    document.getElementById("finishBtn").classList.add("hidden");
  }
}

function saveCurrentAnswer(answer) {
  userAnswers[currentQuestionIndex] = answer;
  updateProgress();
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}

function updateProgress() {
  const answered = userAnswers.filter((ans) => ans !== null).length;
  const progress = Math.round((answered / currentQuestions.length) * 100 || 0);
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById("progressText").textContent = progress + "%";
}

// =====================
// Timer
// =====================
function startTimer() {
  clearInterval(timer);
  timeLeft = 300;
  updateTimerUI();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timer);
      document
        .getElementById("timeoutSound")
        ?.play()
        .catch(() => {});
      alert("انتهى الوقت، سيتم إنهاء الاختبار.");
      submitTest();
    }
  }, 1000);
}

function updateTimerUI() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  document.getElementById("timerText").textContent =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  document.getElementById("timerFill").style.width =
    (timeLeft / 300) * 100 + "%";
}

// =====================
// Submit + Analysis + Save
// =====================
function submitTest() {
  clearInterval(timer);

  if (!currentUser) {
    alert("سجّل دخول أولاً.");
    return;
  }

  const totalQuestions = currentQuestions.length;

  let score = 0;
  let total = 0;
  let percentage = 0;
  let details = null;

  if (currentTest.kind === "quiz") {
    const breakdown = currentQuestions.map((q, idx) => {
      const selected = userAnswers[idx];
      const correct = q.answer;
      const isCorrect = selected === correct;
      if (isCorrect) score++;

      return {
        index: idx + 1,
        question: q.q,
        type: q.type,
        selected: selected ?? null,
        correct,
        isCorrect,
      };
    });

    const byType = {};
    breakdown.forEach((b) => {
      const k = b.type || "غير محدد";
      if (!byType[k]) byType[k] = { total: 0, correct: 0 };
      byType[k].total++;
      if (b.isCorrect) byType[k].correct++;
    });

    const byTypeSorted = Object.entries(byType)
      .map(([type, stat]) => ({
        type,
        total: stat.total,
        correct: stat.correct,
        accuracy: Math.round((stat.correct / stat.total) * 100),
      }))
      .sort((a, b) => b.accuracy - a.accuracy);

    const answered = breakdown.filter((b) => b.selected !== null).length;
    const unanswered = breakdown.length - answered;
    const wrong = breakdown.length - unanswered - score;

    total = totalQuestions;
    percentage = Math.round((score / total) * 100);

    details = {
      breakdown,
      byType: byTypeSorted,
      summary: { score, wrong, unanswered, total: totalQuestions },
    };
  } else {
    score = userAnswers.reduce((s, v) => s + (v || 0), 0);
    total = totalQuestions * 3;
    percentage = Math.round((score / total) * 100);

    const dims = {};
    currentQuestions.forEach((item, idx) => {
      const v = userAnswers[idx] || 0;
      dims[item.dim] = (dims[item.dim] || 0) + v;
    });
    const sorted = Object.entries(dims).sort((a, b) => b[1] - a[1]);
    details = { dims, top: sorted[0]?.[0] || null, sorted };
  }

  const level = levelFromPercentage(percentage);

  const result = {
    id: "R-" + Date.now(),
    userId: currentUser.userId,
    email: currentUser.email,
    fullName: currentUser.fullName,
    age: currentUser.age,
    gender: currentUser.gender,
    stage: currentUser.stage,
    testKey: currentTest.key,
    testName: currentTest.title,
    scientist: currentTest.scientist,
    measures: currentTest.measures,
    score,
    total,
    percentage,
    level,
    details,
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  };

  // Save to API
  api.saveTestResult({
    testKey: currentTest.key,
    testName: currentTest.title,
    scientist: currentTest.scientist,
    score,
    total,
    percentage,
    level,
    details
  }).catch(err => console.error('Failed to save result:', err));

  renderResult(result);
  renderHistory();

  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
}

// =====================
// Render Result + Interpretation
// =====================
function renderResult(r) {
  const lvlClass = levelClass(r.level);
  const desc = getLevelDescriptor(r.level);

  document.getElementById("resultBox").innerHTML = `
    <div class="result-top">
      <div>
        <h3 style="font-size:1.55rem; margin-bottom:8px;">تحليل نتيجتك</h3>
        <p style="line-height:2; color:var(--muted);">
          ${escapeHtml(r.testName)} — ${escapeHtml(r.scientist)}
        </p>
        <span class="level-badge ${lvlClass}">${escapeHtml(r.level)}</span>
      </div>

      <div class="score-circle" style="--progress:${r.percentage}%;">
        <span>${r.percentage}%</span>
      </div>
    </div>

    <div class="report-grid">
      <div class="report-item">
        <h4>ملخص</h4>
        <p><strong>درجتك:</strong> ${r.score}/${r.total}</p>
        <p><strong>النسبة:</strong> ${r.percentage}%</p>
        <p><strong>التاريخ:</strong> ${new Date(r.createdAt).toLocaleString("ar-EG")}</p>
      </div>

      <div class="report-item">
        <h4>ماذا تعني درجتك؟</h4>
        <p style="color:var(--muted); line-height:2;">
          ${escapeHtml(desc.meaning)}
        </p>
        <p style="color:var(--muted); line-height:2;">
          <strong>توصيات:</strong> ${escapeHtml(desc.recommendations)}
        </p>
      </div>

      <div class="report-item">
        <h4>بيانات المستخدم</h4>
        <p><strong>الاسم:</strong> ${escapeHtml(r.fullName)}</p>
        <p><strong>البريد:</strong> ${escapeHtml(r.email || r.userId)}</p>
        <p><strong>العمر:</strong> ${escapeHtml(r.age)}</p>
        <p><strong>الجنس:</strong> ${escapeHtml(r.gender)}</p>
        <p><strong>السنة الدراسية:</strong> ${escapeHtml(r.stage)}</p>
      </div>
    </div>

    <div class="analysis-box">
      <p><strong>تنبيه:</strong> هذه النتيجة لأغراض تعليمية وليست اختبار IQ رسميًا معتمدًا.</p>
    </div>

    <div class="meaning-grid">
      <div>
        <div class="chart-title"><h3>دلالة النسب (كل نطاق يعني إيه)</h3></div>
        ${buildRangeMeaningTable()}
      </div>

      <div>
        <div class="chart-title">
          <h3>دلالة “كل درجة ممكن تجيبها”</h3>
          <p>لو عدد الأسئلة قليل، ستجد جدول لكل درجة خام.</p>
        </div>
        ${r.total <= 10 ? buildRawScoreMeaningTable(r.total) : `<p class="empty-text">الاختبار ذو مجموع كبير؛ راجع جدول النطاقات.</p>`}
      </div>
    </div>
  `;

  // تحليل حسب نوع الأسئلة
  if (r.details?.byType?.length) {
    const strengths = r.details.byType
      .filter((x) => x.accuracy >= 70)
      .map((x) => x.type);
    const needs = r.details.byType
      .filter((x) => x.accuracy < 50)
      .map((x) => x.type);

    const byTypeHTML = `
      <div class="glass-card" style="margin-top:18px;">
        <div class="chart-title">
          <h3>تحليل حسب نوع الأسئلة</h3>
          <p>ده بيساعدك تعرف نقاط قوتك ونقاط التحسين.</p>
        </div>

        <div class="report-grid">
          <div class="report-item">
            <h4>نقاط قوة</h4>
            <p style="color:var(--muted); line-height:2;">
              ${strengths.length ? strengths.map(escapeHtml).join("، ") : "لم تظهر نقاط قوة واضحة بعد — جرّب أكثر من اختبار."}
            </p>
          </div>

          <div class="report-item">
            <h4>نقاط تحتاج تدريب</h4>
            <p style="color:var(--muted); line-height:2;">
              ${needs.length ? needs.map(escapeHtml).join("، ") : "ممتاز — لا توجد نقاط ضعف واضحة حسب هذا الاختبار."}
            </p>
          </div>
        </div>

        <div class="type-bars">
          ${r.details.byType
            .map(
              (t) => `
            <div class="type-bar">
              <div class="type-bar-top">
                <span>${escapeHtml(t.type)}</span>
                <span>${t.correct}/${t.total} — ${t.accuracy}%</span>
              </div>
              <div class="type-progress"><div style="width:${t.accuracy}%"></div></div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
    document
      .getElementById("resultBox")
      .insertAdjacentHTML("beforeend", byTypeHTML);
  }

  // مراجعة إجابات (لو موجود)
  if (r.details?.breakdown?.length) {
    const reviewHTML = `
      <div class="glass-card" style="margin-top:18px;">
        <div class="chart-title">
          <h3>مراجعة إجاباتك (الصحيح والخطأ)</h3>
          <p>سترى إجابتك والإجابة الصحيحة للأسئلة التي أخطأت فيها.</p>
        </div>

        <div class="answers-list">
          ${r.details.breakdown
            .map((item) => {
              const rowClass = item.isCorrect ? "correct" : "wrong";
              const badgeClass = item.isCorrect ? "ok" : "no";
              const badgeText = item.isCorrect ? "صحيح" : "خطأ";
              const selectedText = item.selected
                ? escapeHtml(item.selected)
                : "لم يتم اختيار إجابة";
              const correctText = escapeHtml(item.correct);

              return `
                <div class="answer-row ${rowClass}">
                  <div class="answer-top">
                    <div>
                      <strong>س${item.index}:</strong> ${escapeHtml(item.question)}
                      <div class="answer-meta"><b>نوع السؤال:</b> ${escapeHtml(item.type)}</div>
                    </div>
                    <span class="answer-badge ${badgeClass}">${badgeText}</span>
                  </div>

                  <div class="answer-meta"><b>إجابتك:</b> ${selectedText}</div>

                  ${
                    item.isCorrect
                      ? ""
                      : `<div class="answer-meta"><b>الإجابة الصحيحة:</b> ${correctText}</div>`
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
    document
      .getElementById("resultBox")
      .insertAdjacentHTML("beforeend", reviewHTML);
  }

  // شهادة
  document.getElementById("certificateBox").innerHTML = `
    <div class="certificate">
      <h2>شهادة إتمام</h2>
      <p>تشهد منصة <strong>ذكاء تك</strong> بأن</p>
      <div class="name">${escapeHtml(r.fullName)}</div>
      <p>قد أتم اختبار <strong>${escapeHtml(r.testName)}</strong> (العالم: <strong>${escapeHtml(
        r.scientist,
      )}</strong>)</p>
      <p>وحصل على درجة <strong>${r.score}/${r.total}</strong> بنسبة <strong>${r.percentage}%</strong></p>
      <p>وبمستوى <strong>${escapeHtml(r.level)}</strong></p>
      <p>التاريخ: <strong>${new Date(r.createdAt).toLocaleDateString("ar-EG")}</strong></p>
      <div class="stamp">معتمد<br>تعليميًا</div>
      <div class="actions-center">
        <button class="btn btn-gold" onclick="printCertificate()">فتح الشهادة للطباعة ↗</button>
      </div>
    </div>
  `;

  // تفاصيل جاردنر
  if (r.testKey === "gardner" && r.details?.sorted?.length) {
    const extra = `
      <div class="glass-card" style="margin-top:18px;">
        <div class="chart-title">
          <h3>تحليل الذكاءات المتعددة</h3>
          <p><strong>أقرب نمط:</strong> ${escapeHtml(r.details.top || "-")}</p>
        </div>
        <div class="report-grid">
          ${r.details.sorted
            .map(
              ([k, v]) => `
            <div class="report-item">
              <h4>${escapeHtml(k)}</h4>
              <p>الدرجة: ${v}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
    document.getElementById("resultBox").insertAdjacentHTML("beforeend", extra);
  }
}

// =====================
// History
// =====================
async function renderHistory() {
  const wrap = document.getElementById("historyList");
  if (!wrap) return;

  if (!currentUser) {
    wrap.innerHTML = `<p class="empty-text">سجّل دخول لعرض السجل.</p>`;
    return;
  }

  try {
    // Load from API
    const results = await api.getMyResults();

    if (!results || !results.length) {
      wrap.innerHTML = `<p class="empty-text">لا توجد نتائج محفوظة حتى الآن.</p>`;
      return;
    }

    wrap.innerHTML = results
      .map(
        (r) => `
    <div class="admin-result-card">
      <div class="admin-result-head">
        <h3>${escapeHtml(r.test_name)}</h3>
        <span class="level-badge ${levelClass(r.level)}">${escapeHtml(r.level)}</span>
      </div>
      <div class="admin-result-body">
        <p><strong>العالم:</strong> ${escapeHtml(r.scientist)}</p>
        <p><strong>النسبة:</strong> ${r.percentage}%</p>
        <p><strong>الدرجة:</strong> ${r.score}/${r.total}</p>
        <p><strong>التاريخ:</strong> ${new Date(r.created_at).toLocaleString("ar-EG")}</p>
      </div>
      <div class="admin-card-actions">
        <button class="btn btn-soft" onclick="openResultFromHistory('${r.id}')">عرض التحليل</button>
      </div>
    </div>
  `,
      )
      .join("");
  } catch (error) {
    console.error('Failed to load history:', error);
    wrap.innerHTML = `<p class="empty-text">حدث خطأ أثناء تحميل السجل.</p>`;
  }
}

async function openResultFromHistory(resultId) {
  try {
    // Get all results from API and find the one we need
    const results = await api.getMyResults();
    const r = results.find((x) => x.id.toString() === resultId.toString());
    if (!r) {
      console.error('Result not found:', resultId);
      return;
    }
    // Transform API response to match renderResult format
    const resultData = {
      id: r.id,
      userId: r.user_id,
      email: r.email,
      fullName: r.full_name,
      age: r.age,
      gender: r.gender,
      stage: r.stage,
      testKey: r.test_key,
      testName: r.test_name,
      scientist: r.scientist,
      measures: r.measures,
      score: r.score,
      total: r.total,
      percentage: r.percentage,
      level: r.level,
      details: r.details ? (typeof r.details === 'string' ? JSON.parse(r.details) : r.details) : null,
      createdAt: r.created_at
    };
    renderResult(resultData);
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error('Failed to load result:', error);
  }
}

// =====================
// Modal Auth Functions
// =====================
function openAuthModal(formType) {
  const modal = document.getElementById("authModal");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (!modal) return;

  modal.classList.remove("hidden");

  if (formType === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  }

  // Prefill email if available
  const lastEmail = localStorage.getItem(LS_LAST_EMAIL);
  if (lastEmail) {
    const emailInput = document.getElementById("modalLoginEmail");
    if (emailInput) emailInput.value = lastEmail;
  }
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
}

function switchAuthForm(formType) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (formType === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  }
}

async function modalLogin() {
  const email = document.getElementById("modalLoginEmail").value.trim().toLowerCase();
  const password = document.getElementById("modalLoginPassword").value.trim();
  const msg = document.getElementById("modalLoginMsg");

  msg.textContent = "";
  msg.style.color = "";

  try {
    if (!email || !password) throw new Error("أدخل البريد الإلكتروني وكلمة المرور.");

    const data = await api.login({ email, password });

    currentUser = {
      userId: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      age: data.user.age,
      gender: data.user.gender,
      stage: data.user.stage,
      isAdmin: data.user.isAdmin
    };

    localStorage.setItem(LS_LAST_EMAIL, email);

    msg.style.color = "var(--success)";
    msg.textContent = `مرحباً ${data.user.fullName}! تم تسجيل الدخول بنجاح.`;

    setTimeout(() => {
      closeAuthModal();
      onLoginSuccess();
    }, 800);

  } catch (e) {
    msg.style.color = "var(--danger)";
    msg.textContent = e.message || "فشل تسجيل الدخول";
  }
}

async function modalRegister() {
  const fullName = document.getElementById("modalRegFullName").value.trim();
  const email = document.getElementById("modalRegEmail").value.trim().toLowerCase();
  const age = parseInt(document.getElementById("modalRegAge").value.trim());
  const gender = document.getElementById("modalRegGender").value.trim();
  const stage = document.getElementById("modalRegStage").value.trim();
  const password = document.getElementById("modalRegPassword").value.trim();

  const msg = document.getElementById("modalRegMsg");
  msg.textContent = "";
  msg.style.color = "";

  try {
    if (!isValidFullName(fullName))
      throw new Error("الاسم يجب أن يكون رباعي (4 كلمات على الأقل).");
    if (!isValidEmail(email))
      throw new Error("البريد الإلكتروني غير صالح.");
    if (!Number.isFinite(age) || age < 6 || age > 90)
      throw new Error("العمر غير صالح (يجب بين 6 و 90).");
    if (!gender || !stage) throw new Error("أكمل جميع البيانات.");
    if (!password || password.length < 6)
      throw new Error("كلمة المرور يجب ألا تقل عن 6 أحرف/أرقام.");

    const data = await api.register({
      email,
      password,
      fullName,
      age,
      gender,
      stage
    });

    localStorage.setItem(LS_LAST_EMAIL, email);

    currentUser = {
      userId: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      age: data.user.age,
      gender: data.user.gender,
      stage: data.user.stage
    };

    msg.style.color = "var(--success)";
    msg.textContent = `تم إنشاء الحساب بنجاح! مرحباً ${fullName}`;

    setTimeout(() => {
      closeAuthModal();
      onLoginSuccess();
    }, 800);

  } catch (e) {
    msg.style.color = "var(--danger)";
    msg.textContent = e.message || "حدث خطأ أثناء التسجيل";
  }
}

// =====================
// Expose (onclick)
// =====================
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthForm = switchAuthForm;
window.modalLogin = modalLogin;
window.modalRegister = modalRegister;

window.startSelectedTest = startSelectedTest;

window.saveCurrentAnswer = saveCurrentAnswer;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.submitTest = submitTest;

window.copyText = copyText;
window.openResultFromHistory = openResultFromHistory;
