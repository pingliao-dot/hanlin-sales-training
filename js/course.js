/* =========================================================
   課程頁：單頁精靈（一次只顯示一步）
   - 畫面上「只出現目前這一步」，下面不預先出現其他步驟
   - 按「已看完，前往下一步」才切換到下一步
   - 要回看已完成步驟：點最上方進度條的綠色節點
   - 簡報可翻頁、可全螢幕
   由 auth.js 在登入成功、進度載入後呼叫 initCourse()
   ========================================================= */
function initCourse() {
  var params = new URLSearchParams(location.search);
  var courseId = params.get("id");
  var course = getCourse(courseId);

  if (!course) {
    document.getElementById("courseTitle").textContent = "找不到課程";
    return;
  }

  var total = course.steps.length;
  var activeIndex = null;   // 目前顯示的步驟；null = 全部完成、顯示完成畫面
  var slideIndex = 0;       // 簡報目前頁
  var seenLast = false;     // 這一步「曾經翻到過最後一頁」→ 之後翻回去也保持解鎖
  var keyHandler = null;    // 鍵盤翻頁監聽（避免重複疊加）
  var confettiShown = false;// 彩帶只放一次
  var SLIDE_V = "?v=7";     // 簡報圖片版本；重新輸出投影片後把數字加 1，強制瀏覽器抓新圖

  // AI 生成教材提示（步驟設 ai:true 時顯示；要改文字改這裡即可）
  var AI_NOTICE =
    '<div class="ai-notice">' +
      '<span class="ai-badge">🤖 AI 生成</span>' +
      '<span>部份教材由 NotebookLM AI 協助生成，內容如有錯字敬請見諒；' +
      '學習時請將重點放在教學內容與觀念理解上。</span>' +
    '</div>';

  document.getElementById("courseTitle").textContent = course.title;
  document.title = course.title + " ・ 翰林國小業務新人教育訓練平台";

  var stepsEl = document.getElementById("steps");
  var trackerEl = document.getElementById("stepsTracker");

  var typeMeta = {
    intro:  { icon: "📘", label: "簡介" },
    slides: { icon: "📑", label: "簡報" },
    video:  { icon: "🎬", label: "影片" },
    pdf:    { icon: "📖", label: "手冊" },
    quiz:   { icon: "📝", label: "測驗" }
  };

  function resetActiveToCurrent() {
    var done = getDoneCount(courseId);
    activeIndex = done < total ? done : null;
    seenLast = false;   // 換一步，重新算「有沒有翻到最後一頁」
  }

  function render() {
    // 清掉上一輪的鍵盤監聽
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }

    var done = getDoneCount(courseId);
    trackerEl.innerHTML = "";
    stepsEl.innerHTML = "";

    // ---- 上方進度追蹤列（已完成的節點可點擊回看）----
    course.steps.forEach(function (step, i) {
      var isDone = i < done;
      var isCurrent = i === done;
      var node = document.createElement("div");
      node.className = "tracker-node " +
        (isDone ? "node-done" : isCurrent ? "node-current" : "node-locked") +
        (i === activeIndex ? " node-active" : "");
      node.innerHTML =
        '<span class="node-dot">' + (isDone ? "✓" : (i + 1)) + '</span>' +
        '<span class="node-label">' + step.title + '</span>';
      if (isDone) {
        node.title = "回看「" + step.title + "」";
        node.style.cursor = "pointer";
        node.addEventListener("click", function () { activeIndex = i; slideIndex = 0; seenLast = false; render(); });
      }
      trackerEl.appendChild(node);
      if (i < total - 1) {
        var line = document.createElement("div");
        line.className = "tracker-line " + (isDone ? "line-done" : "");
        trackerEl.appendChild(line);
      }
    });

    // ---- 只顯示目前這一步 ----
    if (activeIndex !== null) {
      var step = course.steps[activeIndex];
      var meta = typeMeta[step.type] || { icon: "•", label: "" };
      var isDone = activeIndex < done;
      stepsEl.appendChild(buildCard(step, activeIndex, isDone, meta));
    }

    // ---- 完成畫面：只有全部完成且沒在回看時才出現 ----
    var banner = document.getElementById("finishBanner");
    if (done >= total && total > 0 && activeIndex === null) {
      document.getElementById("finishName").textContent = course.title;
      banner.hidden = false;
      if (!confettiShown) { confettiShown = true; launchConfetti(); }
    } else {
      banner.hidden = true;
      confettiShown = false;
    }
  }

  /* 慶祝彩帶 */
  function launchConfetti() {
    var host = document.getElementById("confetti");
    if (!host) return;
    host.innerHTML = "";
    var colors = ["#f59e0b", "#2f6fed", "#16a34a", "#ef4444", "#a855f7", "#ffd54a"];
    for (var i = 0; i < 40; i++) {
      var p = document.createElement("i");
      var left = (i * 2.5) % 100;
      var delay = (i % 10) * 0.12;
      var dur = 1.8 + (i % 5) * 0.35;
      p.className = "confetti-piece";
      p.style.left = left + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = delay + "s";
      p.style.animationDuration = dur + "s";
      host.appendChild(p);
    }
  }

  function buildCard(step, i, isDone, meta) {
    var card = document.createElement("section");
    card.className = "step-card step-current step-enter";
    // 步驟 BAR 已標示在哪一步，這裡不再重複標題列，直接放內容
    card.innerHTML = '<div class="step-body">' + renderStepContent(step, i, isDone) + '</div>';
    setTimeout(function () { wireStepContent(card, step, i, isDone); }, 0);
    return card;
  }

  function renderStepContent(step, i, isDone) {
    if (step.type === "intro") {
      var pages = step.pages || [];
      var n = pages.length;
      if (slideIndex >= n) slideIndex = 0;
      if (n > 1 && slideIndex === n - 1) seenLast = true;
      return (
        '<div class="slides slides-intro">' +
          '<div class="intro-wrap">' +
            '<div class="intro-stage">' + (pages[slideIndex] || "") + '</div>' +
            '<div class="scroll-hint" hidden><span>往下還有內容</span></div>' +
          '</div>' +
          (n > 1
            ? '<div class="slide-bar">' +
                '<button class="btn btn-ghost" data-nav="prev">‹ 上一頁</button>' +
                '<span class="slide-count"><b class="cur">' + (slideIndex + 1) + '</b> / ' + n + '</span>' +
                '<button class="btn btn-ghost" data-nav="next">下一頁 ›</button>' +
              '</div>'
            : '') +
        '</div>' +
        doneButton(i, isDone, step.doneLabel || "我已了解，前往下一步",
          (!isDone && n > 1 && !seenLast) ? "請翻到最後一頁，才能前往下一步" : null)
      );
    }
    if (step.type === "slides") {
      var sn = step.slideCount;
      if (sn > 1 && slideIndex === sn - 1) seenLast = true;
      return renderSlides(step) + actionButton(step) +
        doneButton(i, isDone, step.doneLabel || "我已看完簡報，前往下一步",
          (!isDone && sn > 1 && !seenLast) ? "請翻到最後一頁，才能前往下一步" : null);
    }
    if (step.type === "video") {
      return (
        '<div class="viewer video-viewer">' +
          '<video controls preload="metadata" controlsList="nodownload">' +
            '<source src="' + step.file + '" type="video/mp4" />' +
            '您的瀏覽器不支援影片播放。' +
          '</video>' +
        '</div>' +
        doneButton(i, isDone, step.doneLabel || "我已看完影片，前往下一步",
          isDone ? null : "🔒 看完影片後即可前往下一步")
      );
    }
    if (step.type === "pdf") {
      return (
        '<div class="viewer pdf-viewer">' +
          '<iframe src="' + step.file + SLIDE_V + '#view=FitH" title="手冊"></iframe>' +
        '</div>' +
        '<div class="viewer-hint">看不到內容或想放大？' +
          '<a href="' + step.file + SLIDE_V + '" target="_blank" rel="noopener">用新分頁開啟 PDF</a></div>' +
        doneButton(i, isDone, step.doneLabel || "我已看完手冊，前往下一步")
      );
    }
    if (step.type === "quiz") {
      return (
        '<div class="quiz-box">' +
          '<p>請點下方按鈕開啟測驗（Google 表單，會開新分頁）。<mark class="quiz-hl">完成作答後回到本頁按「我已完成測驗」。</mark></p>' +
          '<a class="btn btn-quiz" href="' + step.url + '" target="_blank" rel="noopener">📝 開啟測驗表單</a>' +
        '</div>' +
        doneButton(i, isDone, step.doneLabel || "我已完成測驗")
      );
    }
    return "";
  }

  /* 簡報翻頁器（含全螢幕） */
  function renderSlides(step) {
    var n = step.slideCount;
    if (slideIndex >= n) slideIndex = 0;
    var pad = function (x) { return (x < 10 ? "0" : "") + x; };
    var firstSrc = step.slidesDir + pad(slideIndex + 1) + ".png" + SLIDE_V;
    return (
      '<div class="slides">' +
        '<div class="slide-stage">' +
          '<button class="slide-fs" data-fs aria-label="全螢幕" title="全螢幕">⛶</button>' +
          '<span class="slide-badge"><b class="cur">' + (slideIndex + 1) + '</b> / ' + n + '</span>' +
          '<button class="slide-nav prev" data-nav="prev" aria-label="上一頁">‹</button>' +
          '<img class="slide-img" src="' + firstSrc + '" alt="投影片" />' +
          '<button class="slide-nav next" data-nav="next" aria-label="下一頁">›</button>' +
        '</div>' +
        '<div class="slide-bar">' +
          '<button class="btn btn-ghost" data-nav="prev">‹ 上一頁</button>' +
          '<span class="slide-count"><b class="cur">' + (slideIndex + 1) + '</b> / ' + n + '</span>' +
          '<button class="btn btn-ghost" data-nav="next">下一頁 ›</button>' +
          '<button class="btn btn-ghost" data-fs title="全螢幕">⛶ 全螢幕</button>' +
        '</div>' +
      '</div>'
    );
  }

  /* 全螢幕：優先用原生全螢幕；不支援時（例如 iPhone Safari）改用 CSS 假全螢幕 */
  function toggleFullscreen(el) {
    if (!el) return;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    var exit = document.exitFullscreen || document.webkitExitFullscreen;
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;

    if (!req) {                       // 不支援原生 → CSS 假全螢幕
      el.classList.toggle("fs-fallback");
      return;
    }
    if (fsEl) {
      if (exit) exit.call(document);
      return;
    }
    try {
      var p = req.call(el);
      // 有些瀏覽器會回傳被拒絕的 Promise → 一樣退回假全螢幕
      if (p && p.catch) p.catch(function () { el.classList.add("fs-fallback"); });
    } catch (e) {
      el.classList.add("fs-fallback");
    }
  }

  function actionButton(step) {
    if (!step.action || !step.action.url) return "";
    return '<div class="step-cta"><a class="btn btn-line" href="' + step.action.url +
      '" target="_blank" rel="noopener">' + step.action.label + '</a></div>';
  }

  /* lockText 有值 = 尚未解鎖：按鈕壓灰不可點，滑鼠移上去才顯示原因 */
  function doneButton(i, isDone, labelTodo, lockText) {
    var locked = !!lockText;
    return (
      '<div class="step-actions">' +
        '<button class="btn btn-primary done-btn' + (locked ? ' is-locked' : '') + '" data-step="' + i + '"' +
          (locked ? ' data-tip="' + lockText + '"' : '') + '>' +
          (isDone ? "✓ 前往下一步" : labelTodo) +
        '</button>' +
      '</div>'
    );
  }

  /* 切換按鈕鎖定狀態 */
  function setLocked(btn, locked, tip) {
    if (!btn) return;
    btn.classList.toggle("is-locked", !!locked);
    if (locked) btn.setAttribute("data-tip", tip || "");
    else btn.removeAttribute("data-tip");
  }

  function wireStepContent(card, step, i, isDone) {
    // 完成 / 前往下一步
    var doneBtn = card.querySelector(".done-btn");
    if (doneBtn) {
      doneBtn.addEventListener("click", async function () {
        if (doneBtn.classList.contains("is-locked")) return;  // 尚未解鎖，不能按
        doneBtn.disabled = true;
        await markStepDone(courseId, i);
        resetActiveToCurrent();
        slideIndex = 0;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // 影片：播到結尾才解鎖完成鈕（可快轉）
    if (step.type === "video") {
      if (isDone) return;
      var vid = card.querySelector("video");
      var vBtn = card.querySelector(".done-btn");
      if (!vid || !vBtn) return;
      var unlockVideo = function () { setLocked(vBtn, false); };
      vid.addEventListener("ended", unlockVideo);
      // 保險：快到結尾就解鎖（避免 ended 沒觸發卡住）
      vid.addEventListener("timeupdate", function () {
        if (vid.duration && vid.currentTime >= vid.duration - 1) unlockVideo();
      });
      return;
    }

    // 產品簡介：翻頁（重新渲染）+ 「往下還有」提示
    if (step.type === "intro") {
      var pageCount = (step.pages || []).length;
      card.querySelectorAll("[data-nav]").forEach(function (b) {
        b.addEventListener("click", function () {
          var dir = b.getAttribute("data-nav") === "next" ? 1 : -1;
          slideIndex = (slideIndex + dir + pageCount) % pageCount;
          render();
        });
      });

      // 內容超出可視範圍時，底部顯示「往下還有內容 ⌄」，捲到底就隱藏
      var stage = card.querySelector(".intro-stage");
      var hint = card.querySelector(".scroll-hint");
      if (stage && hint) {
        var updateHint = function () {
          var more = stage.scrollHeight - stage.clientHeight - stage.scrollTop > 12;
          hint.hidden = !more;
        };
        stage.addEventListener("scroll", updateHint);
        window.addEventListener("resize", updateHint);
        setTimeout(updateHint, 60);   // 等版面算好再判斷
      }
      return;
    }

    if (step.type !== "slides") return;

    // 翻頁
    var img = card.querySelector(".slide-img");
    var curEls = card.querySelectorAll(".cur");
    var n = step.slideCount;
    var pad = function (x) { return (x < 10 ? "0" : "") + x; };
    var dBtn = card.querySelector(".done-btn");
    function show(idx) {
      slideIndex = (idx + n) % n; // 循環
      img.src = step.slidesDir + pad(slideIndex + 1) + ".png" + SLIDE_V;
      curEls.forEach(function (el) { el.textContent = slideIndex + 1; });
      // 曾經翻到最後一頁就永久解鎖（翻回前面也不會再鎖上）
      if (slideIndex === n - 1) seenLast = true;
      var unlocked = isDone || n <= 1 || seenLast;
      setLocked(dBtn, !unlocked, "請翻到最後一頁，才能前往下一步");
    }
    card.querySelectorAll("[data-nav]").forEach(function (b) {
      b.addEventListener("click", function () {
        show(b.getAttribute("data-nav") === "next" ? slideIndex + 1 : slideIndex - 1);
      });
    });

    // 全螢幕
    var stage = card.querySelector(".slide-stage");
    card.querySelectorAll("[data-fs]").forEach(function (b) {
      b.addEventListener("click", function () { toggleFullscreen(stage); });
    });

    // 鍵盤左右翻頁（全螢幕內也適用）
    keyHandler = function (e) {
      if (e.key === "ArrowRight") show(slideIndex + 1);
      else if (e.key === "ArrowLeft") show(slideIndex - 1);
    };
    document.addEventListener("keydown", keyHandler);
  }

  var reviewBtn = document.getElementById("reviewBtn");
  if (reviewBtn) {
    reviewBtn.addEventListener("click", function () {
      activeIndex = 0; slideIndex = 0; seenLast = false; render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  resetActiveToCurrent();
  render();
}
