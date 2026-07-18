/* =========================================================
   學習進度（存到 Supabase 資料庫）
   資料表 progress_log：usermail / project / step / completed_at
   ---------------------------------------------------------
   - Progress.load()      登入後把使用者的完成紀錄載入記憶體
   - getDoneCount(id)     某課程已完成到第幾步（依序）
   - markStepDone(id, i)  把第 i 步寫入資料庫（async）
   - resetCourse(id)      刪除該課程的完成紀錄（async）
   ========================================================= */
var Progress = (function () {
  // cache: { 專案標題: Set(已完成步驟標題) }
  var cache = {};
  var gradeCache = {};   // { 專案標題: 分數 }

  async function load() {
    cache = {};
    gradeCache = {};
    if (!window.sb || !window.CURRENT_USER) return;
    var res = await window.sb
      .from("progress_log")
      .select("project, step")
      .eq("usermail", window.CURRENT_USER);
    if (res.error) { console.error("讀取進度失敗", res.error); return; }
    (res.data || []).forEach(function (r) {
      if (!cache[r.project]) cache[r.project] = {};
      cache[r.project][r.step] = true;
    });

    // 讀自己的成績（沒有 grades 表也不會壞）
    try {
      var g = await window.sb
        .from("grades")
        .select("project, score")
        .eq("usermail", window.CURRENT_USER);
      if (!g.error && g.data) {
        g.data.forEach(function (r) { gradeCache[r.project] = r.score; });
      }
    } catch (e) { /* 忽略 */ }
  }

  function grade(courseId) {
    var c = getCourse(courseId);
    if (!c) return null;
    return (gradeCache[c.title] != null && gradeCache[c.title] !== "") ? gradeCache[c.title] : null;
  }

  function completedMap(projectTitle) {
    return cache[projectTitle] || {};
  }

  function doneCount(courseId) {
    var c = getCourse(courseId);
    if (!c) return 0;
    var map = completedMap(c.title);
    var k = 0;
    for (var i = 0; i < c.steps.length; i++) {
      if (map[c.steps[i].title]) k++;
      else break; // 依序：遇到第一個沒完成的就停
    }
    return k;
  }

  async function markStepDone(courseId, stepIndex) {
    var c = getCourse(courseId);
    if (!c) return;
    var step = c.steps[stepIndex];
    if (!step) return;

    // 先更新記憶體，畫面即時反應
    if (!cache[c.title]) cache[c.title] = {};
    cache[c.title][step.title] = true;

    if (!window.sb || !window.CURRENT_USER) return;
    // 不從前端送 completed_at，交給資料庫的 default now() 產生，時間無法被竄改
    var row = {
      usermail: window.CURRENT_USER,
      username: window.CURRENT_USER_NAME || null,
      project: c.title,
      step: step.title
    };
    var res = await window.sb
      .from("progress_log")
      .upsert(row, { onConflict: "usermail,project,step" });
    if (res.error) {
      console.error("寫入進度失敗", res.error);
      alert("進度儲存失敗，請檢查網路後再試一次。");
    }
  }

  async function resetCourse(courseId) {
    var c = getCourse(courseId);
    if (!c) return;
    delete cache[c.title];
    if (!window.sb || !window.CURRENT_USER) return;
    var res = await window.sb
      .from("progress_log")
      .delete()
      .eq("usermail", window.CURRENT_USER)
      .eq("project", c.title);
    if (res.error) console.error("重設進度失敗", res.error);
  }

  return { load: load, doneCount: doneCount, markStepDone: markStepDone, resetCourse: resetCourse, grade: grade };
})();

/* 讓其他檔案沿用原本的函式名稱 */
function getDoneCount(courseId) { return Progress.doneCount(courseId); }
function markStepDone(courseId, stepIndex) { return Progress.markStepDone(courseId, stepIndex); }
function resetCourse(courseId) { return Progress.resetCourse(courseId); }
