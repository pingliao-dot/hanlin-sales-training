/* 首頁：產生學習區塊卡片（精簡版：只有專案名稱 + 狀態）
   由 auth.js 在登入成功、進度載入後呼叫 initHome() */
function initHome() {
  var container = document.getElementById("blocks");
  if (!container) return;
  container.innerHTML = "";

  var n = 0;
  COURSES.forEach(function (course) {
    if (!course.available) return; // 只顯示已上架的專案
    n++;

    var total = course.steps.length;
    var done = getDoneCount(course.id);
    var allDone = total > 0 && done >= total;

    var statusLabel = allDone ? "✓ 已結案" : "進行中";
    var statusClass = allDone ? "status-done" : "status-progress";

    // 成績列：完成測驗的課才顯示（有分數→顯示，沒填→未公佈）
    var hasQuiz = course.steps.some(function (s) { return s.type === "quiz"; });
    var gradeHtml = "";
    if (hasQuiz && allDone) {
      var g = Progress.grade(course.id);
      if (g != null) {
        var disp = /^\d+(\.\d+)?$/.test(String(g)) ? (g + " 分") : g;
        gradeHtml = '<span class="block-grade has">成績 <b>' + disp + '</b></span>';
      } else {
        gradeHtml = '<span class="block-grade none">成績　未公佈</span>';
      }
    }

    var card = document.createElement("a");
    card.className = "block-card" + (allDone ? " is-done" : "");
    card.href = "course.html?id=" + encodeURIComponent(course.id);
    card.style.setProperty("--accent", course.accent || "#2748d6");

    card.innerHTML =
      (allDone ? '<span class="block-badge-done">✓</span>' : '') +
      '<span class="block-num">第<b>' + n + '</b>堂課</span>' +
      '<h3 class="block-title">' + course.title + '</h3>' +
      (course.minutes ? '<span class="block-time">⏱ 約 ' + course.minutes + ' 分鐘</span>' : '') +
      '<span class="block-status ' + statusClass + '">' + statusLabel + '</span>' +
      gradeHtml;

    container.appendChild(card);
  });
}
