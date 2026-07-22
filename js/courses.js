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
    gradeCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS3hMcuzSAMlBiACCBSuAwpksB5yVHq5XS-s4aRbOMiH6ChWqetq2-1GK_nGmSzpIvGH2YtmIJRWqf0/pub?output=csv",
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

          '<h2 class="intro-title">如何進入？</h2>' +
          '<p class="intro-lead">兩種方式都能登入會員中心：</p>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">🔎</div>' +
              '<h3>方式一：網站右上角</h3>' +
              '<p>在各種需要登入的翰林網站，<b>右上角</b>就能看到「登入」按鈕。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">↪️</div>' +
              '<h3>方式二：進入產品時</h3>' +
              '<p>在<b>未登入</b>的狀態下進入產品，系統會自動導向登入畫面。</p>' +
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
        url: "https://forms.gle/35Ny431CQNLbChMZ6"
      }
    ]
  },

  {
    id: "action-master",
    minutes: 40,          // 學習所需時間（分鐘，含自己操作）
    gradeCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOkNfl2u7OTj-FnoSpr-eP-Y2WhpD9w-tj8B28Y-PR_aH--XID-GkOl-3cPx7nf-aOYrRb_zGn_JKN/pub?output=csv",  // 測驗成績（Google 表單發布的 CSV）
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

          '<h2 class="intro-title">如何進入？</h2>' +
          '<p class="intro-lead">兩種方式都能打開行動大師：</p>' +
          '<div class="howto">' +
            '<div class="howto-row"><span class="howto-tag">🔎 搜尋</span>' +
              '<span class="howto-val">翰林行動大師</span></div>' +
            '<div class="howto-row"><span class="howto-tag">🔗 網址</span>' +
              '<a href="https://edisc3.hle.com.tw" target="_blank" rel="noopener">https://edisc3.hle.com.tw</a></div>' +
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
    gradeCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_cLRx-38DCTjI0xAfVYL9n4VD12uguOzi0q_wh5gQqEEBkDOuwE-p0BTwooraw2hW9lG2a63JAXKj/pub?output=csv",
    title: "電子書",
    subtitle: "翰林電子書　介紹與操作",
    desc: "認識電子書的功能與教學應用，並熟悉實際操作流程。",
    badge: "國小業務",
    icon: "📚",
    accent: "#0891b2",
    available: true,
    steps: [
      {
        type: "intro",
        title: "產品簡介",
        desc: "先認識電子書",
        doneLabel: "我了解了，開始上課",
        pages: [
          '<h2 class="intro-title">「翰林電子書」是什麼？</h2>' +
          '<p class="intro-lead">它是翰林將<b>紙本教材數位化</b>後，提供老師在電腦、平板或觸屏上使用的' +
            '<b>互動式數位教材</b>。</p>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">💻</div>' +
              '<h3>電腦、平板、觸屏都能用</h3>' +
              '<p>把紙本教材數位化，讓老師在各種裝置上都能開啟、教學。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">🧰</div>' +
              '<h3>它不只是一本 PDF</h3>' +
              '<p><mark class="hl">而是結合教學工具、互動功能與各種資源的完整學習環境。</mark></p>' +
            '</div>' +
          '</div>',

          '<h2 class="intro-title">如何取得電子書？</h2>' +
          '<div class="howto">' +
            '<div class="howto-row"><span class="howto-tag">🔎 搜尋</span>' +
              '<span class="howto-val">翰林行動大師</span></div>' +
          '</div>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">☁️</div>' +
              '<h3>線上版行動大師</h3>' +
              '<p>可<b>直接使用線上版電子書</b>。<br>' +
                '此外線上版行動大師，也能下載<b>電腦版電子書的 ISO 檔</b>。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">💻</div>' +
              '<h3>電腦版行動大師</h3>' +
              '<p>可透過電腦版行動大師，<b>下載並安裝電子書</b>。<br>' +
                '此外電腦版行動大師，也能<b>直接開啟線上版電子書</b>。</p>' +
            '</div>' +
          '</div>',

          '<h2 class="intro-title">這堂課，你將學到：</h2>' +
          '<ul class="intro-list">' +
            '<li>電子書分為<b>哪幾種版本</b></li>' +
            '<li>工具列上有哪些<b>基本功能</b></li>' +
            '<li>如何<b>自訂工具列</b></li>' +
            '<li><b>數學科</b>避免畫面變形如何調整</li>' +
            '<li>如何<b>快速切換畫筆與滑鼠</b></li>' +
            '<li>如何<b>使用畫筆時還能點擊到按鈕</b></li>' +
            '<li>如何<b>儲存班級紀錄</b></li>' +
            '<li>如何<b>同步紀錄至雲端</b></li>' +
          '</ul>'
        ]
      },
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
    gradeCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjLj-S8fEUsIbjx4ORh7Oj3HUw6nI6-QWqFisqzohFqTGH90Q2MkDkGlTJIoZuxT-REpZcck1aBVaL/pub?output=csv",
    title: "命題大師與雲端速測",
    subtitle: "翰林命題大師　介紹",
    desc: "認識命題大師的出題功能，協助老師快速命題。",
    badge: "國小業務",
    icon: "✍️",
    accent: "#db2777",
    available: true,
    steps: [
      {
        type: "intro",
        title: "產品簡介",
        desc: "先認識命題大師與雲端速測",
        doneLabel: "我了解了，開始上課",
        pages: [
          '<h2 class="intro-title">「翰林命題大師」是什麼？</h2>' +
          '<p class="intro-lead">它是一個<b>「線上出題系統」</b>，' +
            '<mark class="hl">解決老師日常出題與排版的繁瑣流程</mark>。</p>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">🗂</div>' +
              '<h3>完整的學科題庫</h3>' +
              '<p>擁有完整的學科題庫，能自動產出標準格式的紙本考卷。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">📄</div>' +
              '<h3>主要用途：紙筆測驗</h3>' +
              '<p>老師挑選題目後，可直接下載排版好的 Word，用於傳統的紙筆測驗。</p>' +
            '</div>' +
          '</div>',

          '<h2 class="intro-title">「翰林雲端速測」是什麼？</h2>' +
          '<p class="intro-lead">它是一個<b>「免紙筆的線上測驗服務」</b>，為命題大師的<b>附加功能</b>。' +
            '老師透過命題大師挑選題目後，系統會自動將測驗轉化為線上考試，' +
            '並在學生送出後<mark class="hl">自動閱卷</mark>。</p>' +
          '<p class="intro-sub">適用情境</p>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">📱</div>' +
              '<h3>課堂互動教學</h3>' +
              '<p>配合「生生用平板」政策，讓課堂互動更即時。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">⏰</div>' +
              '<h3>課堂時間不足時</h3>' +
              '<p>作為派發課後作業的數位解決方案。</p>' +
            '</div>' +
          '</div>',

          '<h2 class="intro-title">如何進入？</h2>' +
          '<div class="howto">' +
            '<div class="howto-row"><span class="howto-tag">🔎 搜尋</span>' +
              '<span class="howto-val">翰林命題大師</span></div>' +
            '<div class="howto-row"><span class="howto-tag">🔗 網址</span>' +
              '<a href="https://testbank.hle.com.tw" target="_blank" rel="noopener">https://testbank.hle.com.tw</a></div>' +
          '</div>' +
          '<div class="intro-card">' +
            '<div class="intro-ico">🔗</div>' +
            '<h3>也整合在行動大師裡</h3>' +
            '<p>可於行動大師<b>右側</b>選擇「題庫」，點擊「命題大師」的<b>前往</b>按鈕。</p>' +
          '</div>',

          '<h2 class="intro-title">這堂課，你將學到：</h2>' +
          '<ul class="intro-list">' +
            '<li>命題大師與雲端速測的<b>特色</b></li>' +
            '<li>命題大師<b>快速、電腦、手動命題</b>，適合什麼情境</li>' +
            '<li>如何進行<b>挑題（組卷流程）</b></li>' +
            '<li>如何<b>產生雲端速測及進行派發</b></li>' +
          '</ul>'
        ]
      },
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
        type: "slides",
        title: "操作引導",
        desc: "命題大師操作引導手冊",
        ai: true,
        slidesDir: "assets/命題大師/slides-guide/",
        slideCount: 26,
        pdf: "assets/命題大師/命題大師操作引導.pdf"
      },
      {
        type: "video",
        title: "介紹影片",
        desc: "命題大師介紹影片",
        ai: true,
        file: "assets/命題大師/命題大師介紹影片.mp4"
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
        type: "intro",
        title: "認識小幫手",
        desc: "認識並加入小幫手 LINE@",
        doneLabel: "我已加入 LINE@，完成",
        pages: [
          '<h2 class="intro-title">「翰林小幫手」是什麼？</h2>' +
          '<p class="intro-lead">它是由<b>數位部</b>經營、<b>專門服務業務同仁</b>的 LINE 帳號。' +
            '同仁如果有數位產品的問題，都可以即時與小幫手聯絡。</p>' +
          '<div class="intro-cards">' +
            '<div class="intro-card">' +
              '<div class="intro-ico">💬</div>' +
              '<h3>有問題，隨時問</h3>' +
              '<p>遇到數位產品的問題就傳訊息給我們，我們會盡快了解狀況並給予協助。</p>' +
            '</div>' +
            '<div class="intro-card">' +
              '<div class="intro-ico">🕘</div>' +
              '<h3>服務時間</h3>' +
              '<p>週一至週五<br><b>早上 9:00 ～ 下午 6:00</b></p>' +
            '</div>' +
            '<div class="intro-card warn">' +
              '<div class="intro-ico">⚠️</div>' +
              '<h3>僅服務業務同仁</h3>' +
              '<p><mark class="hl">此 LINE 並未開放給老師加入，請勿轉傳給老師。</mark></p>' +
            '</div>' +
          '</div>',

          '<h2 class="intro-title">最後一步：立即加入小幫手</h2>' +
          '<p class="intro-lead">用手機掃描 QR code，或直接點按鈕加入。</p>' +
          '<div class="join-box">' +
            '<img class="join-qr" src="assets/小幫手/line-qr.png" alt="翰林小幫手 LINE QR code" />' +
            '<div class="join-side">' +
              '<a class="btn btn-line" href="https://line.me/R/ti/p/@jxb9444o" target="_blank" rel="noopener">' +
                '➕ 點我直接加入 LINE@</a>' +
              '<p class="join-note">加入後，請傳送下面這句話給小幫手 👇</p>' +
              '<div class="join-msg">hi 我剛加入翰林團隊，此為教育訓練的作業回覆</div>' +
            '</div>' +
          '</div>'
        ]
      }
    ]
  }
];

/* 提供給其他頁面查詢 */
function getCourse(id) {
  return COURSES.find(function (c) { return c.id === id; });
}
