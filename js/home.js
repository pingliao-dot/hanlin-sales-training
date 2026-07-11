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

    var statusLabel = allDone ? "已結案" : "進行中";
    var statusClass = allDone ? "status-done" : "status-progress";
    var num = (n < 10 ? "0" : "") + n;

    var card = document.createElement("a");
    card.className = "block-card";
    card.href = "course.html?id=" + encodeURIComponent(course.id);
    card.style.setProperty("--accent", course.accent || "#2748d6");

    card.innerHTML =
      '<span class="block-num">' + num + '</span>' +
      '<h3 class="block-title">' + course.title + '</h3>' +
      '<span class="block-status ' + statusClass + '">' + statusLabel + '</span>';

    container.appendChild(card);
  });
}
