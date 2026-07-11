/* =========================================================
   登入閘門（Google 登入，限公司網域）
   - 建立 Supabase client（放在 window.sb 供其他檔案使用）
   - 沒登入 → 顯示登入畫面
   - 登入但不是公司網域 → 登出並提示
   - 登入成功 → 載入使用者進度，啟動該頁（首頁 / 課程頁）
   ========================================================= */
(function () {
  var cfg = window.APP_CONFIG || {};

  // 尚未填入設定時，給明確提示，避免整頁空白
  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("YOUR-PROJECT") !== -1) {
    showOverlay('<div class="login-card"><h2>尚未設定 Supabase</h2>' +
      '<p class="login-sub">請先依「部署設定指南.md」建立 Supabase 專案，' +
      '並把網址與金鑰填入 <code>js/config.js</code>。</p></div>');
    return;
  }

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  window.sb = sb;

  boot();

  async function boot() {
    var res = await sb.auth.getSession();
    var session = res && res.data ? res.data.session : null;

    if (!session) { renderLogin(); return; }

    var email = (session.user && session.user.email) || "";
    if (email.slice(-(cfg.ALLOWED_DOMAIN.length + 1)).toLowerCase() !== ("@" + cfg.ALLOWED_DOMAIN).toLowerCase()) {
      await sb.auth.signOut();
      renderLogin("此平台僅開放 @" + cfg.ALLOWED_DOMAIN + " 的公司帳號登入。");
      return;
    }

    window.CURRENT_USER = email;
    renderUserChip(email);
    removeOverlay();

    // 載入進度後啟動該頁
    try { await Progress.load(); } catch (e) { console.error("載入進度失敗", e); }
    if (document.getElementById("adminApp") && typeof initAdmin === "function") initAdmin();
    else if (document.getElementById("blocks") && typeof initHome === "function") initHome();
    else if (document.getElementById("steps") && typeof initCourse === "function") initCourse();
  }

  function renderLogin(message) {
    showOverlay(
      '<div class="login-card">' +
        '<div class="login-mark">翰</div>' +
        '<h2>業務教育訓練平台</h2>' +
        '<p class="login-sub">請用公司 Google 帳號（@' + cfg.ALLOWED_DOMAIN + '）登入</p>' +
        (message ? '<p class="login-error">' + message + '</p>' : '') +
        '<button id="googleLoginBtn" class="btn-google">' +
          '<span class="g-icon">G</span> 使用 Google 登入' +
        '</button>' +
      '</div>'
    );
    var btn = document.getElementById("googleLoginBtn");
    if (btn) btn.addEventListener("click", signIn);
  }

  async function signIn() {
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: location.origin + location.pathname + location.search,
        queryParams: { hd: cfg.ALLOWED_DOMAIN, prompt: "select_account" }
      }
    });
  }

  function renderUserChip(email) {
    var nav = document.querySelector(".header-nav");
    if (!nav) return;
    var chip = document.createElement("span");
    chip.className = "user-chip";
    chip.innerHTML = '<span class="user-mail"></span>' +
      '<button class="logout-btn" id="logoutBtn">登出</button>';
    var mailEl = chip.querySelector(".user-mail");
    mailEl.textContent = email;   // 用 textContent，避免任何 HTML 注入
    mailEl.title = email;
    nav.appendChild(chip);
    var lo = document.getElementById("logoutBtn");
    if (lo) lo.addEventListener("click", async function () {
      await sb.auth.signOut();
      location.reload();
    });
  }

  function showOverlay(html) {
    removeOverlay();
    var ov = document.createElement("div");
    ov.id = "authOverlay";
    ov.className = "auth-overlay";
    ov.innerHTML = html;
    document.body.appendChild(ov);
  }
  function removeOverlay() {
    var ov = document.getElementById("authOverlay");
    if (ov) ov.parentNode.removeChild(ov);
  }
})();
