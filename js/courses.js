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
    minutes: 15,          // 學習所需時間（分鐘，含自己操作）
    title: "會員中心",
    subtitle: "翰林會員中心　推廣與導覽",
    desc: "認識會員中心的功能與推廣話術，學會如何向客戶導覽。",
    badge: "國小業務",
    icon: "🪪",
    accent: "#2f6fed",
    available: true,
    steps: [
      {
        type: "intro",
        title: "產品簡介",
        desc: "先認識會員中心",
        doneLabel: "我了解了，開始上課",
        pages: [
          '<h2 class="intro-title">「翰林會員中心」是什麼？</h2>' +
          '<p class="intro-lead">它是一個統一的<b>「帳號管理」系統</b>。老師只要完成登入，就能' +
            '<mark class="hl">一鍵暢行翰林出版提供的所有數位服務與資源</mark>。</p>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">🚪</div>' +
              '<h3>它是「翰林的大門」</h3>' +
              '<p>要使用翰林強大的數位服務，第一步就是請老師推開這扇大門（登入帳號）。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">⭐</div>' +
              '<h3>它是「個人化的起點」</h3>' +
              '<p>登入不只是為了安全，更是為了幫老師保存各種設定與紀錄。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">✅</div>' +
              '<h3>這是「業界的標準配備」</h3>' +
              '<p>免擔心老師排斥！不只翰林，各大同業、甚至教育部的數位平台，通通都需要登入才能使用，' +
                '這對老師來說是再熟悉不過的日常操作了。</p>' +
            '</div>' +
          '</div>',

          '<h2 class="intro-title">這堂課，你將學到：</h2>' +
          '<ul class="intro-list">' +
            '<li>登入方式基本分為<b>哪幾種</b></li>' +
            '<li>遇到<b>全新、還沒有帳號</b>的老師，建議他申請哪一種</li>' +
            '<li><b>跑班</b>、使用共用電腦的老師，如何更快速登入</li>' +
            '<li>並且<b>完成你自己的帳號註冊</b></li>' +
          '</ul>'
        ]
      },
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
    minutes: 40,          // 學習所需時間（分鐘，含自己操作）
    title: "行動大師",
    subtitle: "翰林行動大師　介紹與操作",
    desc: "認識行動大師的功能與操作方式，掌握業務作戰要領。",
    badge: "國小業務",
    icon: "📱",
    accent: "#7c3aed",
    available: true,
    steps: [
      {
        type: "intro",
        title: "產品簡介",
        desc: "先認識行動大師",
        doneLabel: "我了解了，開始上課",
        pages: [
          '<h2 class="intro-title">「翰林行動大師」是什麼？</h2>' +
          '<p class="intro-lead">它是翰林最核心的<b>「備課平台」</b>。如果說會員中心是翰林的大門，' +
            '那行動大師就是門後那座<mark class="hl">「應有盡有的數位圖書館」</mark>。</p>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">📚</div>' +
              '<h3>應有盡有的數位圖書館</h3>' +
              '<p>老師上課要用的電子書、備課資源、影音媒體，通通都在這裡。不論是課本、習作、教案、還是補充影片，一應俱全。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">⚡</div>' +
              '<h3>隨時隨地輕鬆備課</h3>' +
              '<p>只要打開行動大師，老師就能隨時隨地輕鬆備課、上課。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">📖</div>' +
              '<h3>內含電子書書櫃</h3>' +
              '<p>不管學校教室是用觸屏，還是老師自己用筆電、平板投播，都能透過行動大師取得及開啟電子書。</p>' +
            '</div>' +
          '</div>',

          '<h2 class="intro-title">這堂課，你將學到：</h2>' +
          '<ul class="intro-list">' +
            '<li>了解行動大師分為<b>哪幾種版本</b></li>' +
            '<li>了解國小有哪些<b>重要資源</b></li>' +
            '<li>了解老師最需要的<b>題目及互動遊戲</b>在哪裡</li>' +
            '<li>如何獲得領域<b>最新的消息</b></li>' +
            '<li>我們要<b>如何進行下載</b></li>' +
            '<li>發生<b>下載異常</b>時怎麼辦</li>' +
          '</ul>'
        ]
      },
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
        slideCount: 20,
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
    minutes: 30,          // 學習所需時間（分鐘，含自己操作）
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
    minutes: 40,          // 學習所需時間（分鐘，含自己操作）
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
  },

  {
    id: "line-helper",
    minutes: 5,          // 學習所需時間（分鐘，含自己操作）
    title: "小幫手",
    subtitle: "翰林小幫手 LINE@",
    desc: "加入翰林小幫手 LINE@，隨時取得業務支援。",
    badge: "國小業務",
    icon: "💬",
    accent: "#06c755",
    available: true,
    steps: [
      {
        type: "slides",
        title: "看文件",
        desc: "加入小幫手 LINE@",
        slidesDir: "assets/小幫手/slides/",
        slideCount: 2,
        action: { label: "➕ 點我直接加入 LINE@", url: "https://line.me/R/ti/p/@jxb9444o" },
        doneLabel: "我已加入 LINE@，完成"
      }
    ]
  }
];

/* 提供給其他頁面查詢 */
function getCourse(id) {
  return COURSES.find(function (c) { return c.id === id; });
}
