/* 首頁：產生學習區塊卡片
   - 完成度 分子/分母（未完成時 highlight 分子）
   - 右上角：成績待公佈 / 獎牌+分數
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
    var hasQuiz = course.steps.some(function (s) { return s.type === "quiz"; });

    // 右上角：成績（完成整堂課才出現）
    var award = "";
    if (hasQuiz && allDone) {
      var g = Progress.grade(course.id);
      if (g != null) {
        var b = gradeBadge(g);
        award = '<span class="block-award ' + b.cls + '">' +
          (b.icon ? '<span class="award-ico">' + b.icon + '</span>' : '') +
          '<span class="award-txt">' + b.text + '</span></span>';
      } else {
        award = '<span class="block-award pending">成績待公佈</span>';
      }
    }

    var hot = (done < total) ? " hot" : "";  // 未全部完成 → highlight 分子

    var card = document.createElement("a");
    card.className = "block-card";
    card.href = "course.html?id=" + encodeURIComponent(course.id);
    card.style.setProperty("--accent", course.accent || "#2748d6");

    card.innerHTML =
      award +
      '<span class="block-num">第<b>' + n + '</b>堂課</span>' +
      '<h3 class="block-title">' + course.title + '</h3>' +
      (course.minutes ? '<span class="block-time">⏱ 約 ' + course.minutes + ' 分鐘</span>' : '') +
      '<span class="block-frac">完成度 ' +
        '<b class="frac-num' + hot + '">' + done + '</b>' +
        '<span class="frac-sep">/</span>' + total + '</span>';

    container.appendChild(card);
  });
}

/* 依分數決定獎牌：100金、90-99銀、80-89無牌、<80哭臉；非數字則原樣顯示 */
function gradeBadge(score) {
  var s = String(score).trim();
  if (!/^\d+(\.\d+)?$/.test(s)) return { icon: "", text: s, cls: "g-plain" };
  var v = parseFloat(s);
  if (v >= 100) return { icon: "🥇", text: v + " 分", cls: "g-gold" };
  if (v >= 90)  return { icon: "🥈", text: v + " 分", cls: "g-silver" };
  if (v >= 80)  return { icon: "🙂", text: v + " 分", cls: "g-plain" };
  return { icon: "😢", text: v + " 分", cls: "g-low" };
}
