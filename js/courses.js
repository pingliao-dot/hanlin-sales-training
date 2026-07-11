/* =========================================================
   課程資料設定檔
   ---------------------------------------------------------
   未來要新增一個「學習區塊（專案）」，只要在 COURSES 陣列
   裡複製一個物件、改內容即可，網站其他部分都會自動更新。

   每個 step（步驟）的 type 支援三種：
     - "slides" : 顯示 PDF 簡報（file 指向 .pdf）
     - "video"  : 播放影片（file 指向 .mp4）
     - "quiz"   : 開啟測驗連結（url 指向 Google 表單等）
   ========================================================= */
const COURSES = [
  {
    id: "member-center",
    title: "會員中心",
    subtitle: "翰林會員中心　推廣與導覽",
    desc: "認識會員中心的功能與推廣話術，學會如何向客戶導覽。",
    badge: "國小業務",
    icon: "🪪",
    accent: "#2f6fed",
    available: true,
    steps: [
      {
        type: "slides",
        title: "看簡報",
        desc: "翰林會員中心簡報",
        ai: true,                               // 由 NotebookLM AI 生成 → 顯示提示
        slidesDir: "assets/會員中心/slides/", // 投影片圖片資料夾
        slideCount: 8,                          // 共幾頁
        pdf: "assets/會員中心/翰林會員中心.pdf"  // 備用：下載完整 PDF
      },
      {
        type: "video",
        title: "看影片",
        desc: "翰林會員中心推廣與導覽教戰手冊",
        ai: true,
        file: "assets/會員中心/翰林會員中心推廣與導覽教戰手冊.mp4"
      },
      {
        type: "quiz",
        title: "作測驗",
        desc: "國小業務測驗（Google 表單）",
        url: "https://forms.gle/rzytv8Xq5yVzvTet9"
      }
    ]
  },

  {
    id: "action-master",
    title: "行動大師",
    subtitle: "翰林行動大師　介紹與操作",
    desc: "認識行動大師的功能與操作方式，掌握業務作戰要領。",
    badge: "國小業務",
    icon: "📱",
    accent: "#7c3aed",
    available: true,
    steps: [
      {
        type: "slides",
        title: "行動大師介紹",
        desc: "認識行動大師",
        ai: true,
        slidesDir: "assets/行動大師/slides-intro/",
        slideCount: 14,
        pdf: "assets/行動大師/行動大師介紹.pdf"
      },
      {
        type: "slides",
        title: "操作指引",
        desc: "行動大師操作步驟",
        ai: true,
        slidesDir: "assets/行動大師/slides-guide/",
        slideCount: 15,
        pdf: "assets/行動大師/行動大師-操作指引.pdf"
      },
      {
        type: "video",
        title: "看影片",
        desc: "翰林行動大師 3：業務必勝作戰手冊",
        ai: true,
        file: "assets/行動大師/翰林行動大師3：業務必勝作戰手冊.mp4"
      },
      {
        type: "quiz",
        title: "作測驗",
        desc: "行動大師測驗（Google 表單）",
        url: "https://forms.gle/HuFHASMnM19YFPSe7"
      }
    ]
  },

  {
    id: "ebook",
    title: "電子書",
    subtitle: "翰林電子書　介紹與操作",
    desc: "認識電子書的功能與教學應用，並熟悉實際操作流程。",
    badge: "國小業務",
    icon: "📚",
    accent: "#0891b2",
    available: true,
    steps: [
      {
        type: "slides",
        title: "電子書介紹",
        desc: "認識電子書",
        ai: true,
        slidesDir: "assets/電子書/slides-intro/",
        slideCount: 10,
        pdf: "assets/電子書/電子書介紹.pdf"
      },
      {
        type: "video",
        title: "介紹影片",
        desc: "電子書介紹影片",
        ai: true,
        file: "assets/電子書/電子書介紹影片.mp4"
      },
      {
        type: "slides",
        title: "操作指引",
        desc: "電子書操作指引手冊",
        ai: true,
        slidesDir: "assets/電子書/slides-guide/",
        slideCount: 15,
        pdf: "assets/電子書/電子書操作指引.pdf"
      },
      {
        type: "quiz",
        title: "作測驗",
        desc: "電子書作業（Google 表單）",
        url: "https://forms.gle/UNmDziRvZcyiAeBY6"
      }
    ]
  },

  {
    id: "quiz-master",
    title: "命題大師",
    subtitle: "翰林命題大師　介紹",
    desc: "認識命題大師的出題功能，協助老師快速命題。",
    badge: "國小業務",
    icon: "✍️",
    accent: "#db2777",
    available: true,
    steps: [
      {
        type: "slides",
        title: "命題大師介紹",
        desc: "認識命題大師",
        ai: true,
        slidesDir: "assets/命題大師/slides-intro/",
        slideCount: 12,
        pdf: "assets/命題大師/命題大師介紹.pdf"
      },
      {
        type: "video",
        title: "介紹影片",
        desc: "命題大師介紹影片",
        ai: true,
        file: "assets/命題大師/命題大師介紹影片.mp4"
      },
      {
        type: "slides",
        title: "操作引導",
        desc: "命題大師操作引導手冊",
        ai: true,
        slidesDir: "assets/命題大師/slides-guide/",
        slideCount: 26,
        pdf: "assets/命題大師/命題大師操作引導.pdf"
      },
      {
        type: "quiz",
        title: "作測驗",
        desc: "命題大師 & 雲端速測測驗（Google 表單）",
        url: "https://forms.gle/RgPdu1wXGFJzpmqK7"
      }
    ]
  }
];

/* 提供給其他頁面查詢 */
function getCourse(id) {
  return COURSES.find(function (c) { return c.id === id; });
}
