/* =========================================================
   後台（僅限管理者白名單）：三個分頁
   - 學習進度：全員進度（含區別/職位），搜尋、篩區、匯出、刪除
   - 成績管理：對已完成測驗者填分數，篩區、匯出
   - 管理者設定：新增/移除可進後台的 email
   區別來源：手動指定(user_region) 優先，其次內建對照(REGION_MAP)
   ========================================================= */
async function initAdmin() {
  var app = document.getElementById("adminApp");
  if (!app) return;
  app.innerHTML = '<p class="admin-loading">載入中…</p>';

  var chk = await window.sb.rpc("is_admin");
  if (chk.error || !chk.data) {
    app.innerHTML =
      '<div class="admin-denied">🔒 你沒有後台檢視權限。<br>' +
      '如需開通，請將你的 email 加入 Supabase 的 <code>admins</code> 資料表。</div>';
    return;
  }

  var pr = await window.sb.from("progress_log")
    .select("id, usermail, username, project, step, completed_at")
    .order("completed_at", { ascending: false });
  if (pr.error) { app.innerHTML = '<div class="admin-denied">讀取失敗：' + pr.error.message + '</div>'; return; }
  window.__ADMIN_ROWS = pr.data || [];

  var gr = await window.sb.from("grades").select("usermail, username, project, score");
  window.__GRADES = {};
  if (!gr.error && gr.data) gr.data.forEach(function (r) { window.__GRADES[r.usermail + "||" + r.project] = r.score; });

  var ad = await window.sb.from("admins").select("email").order("email");
  window.__ADMINS = (!ad.error && ad.data) ? ad.data.map(function (r) { return r.email; }) : [];

  var reg = await window.sb.from("user_region").select("usermail, region, title");
  window.__REGIONS = {};   // { email: { region, title } } 手動指定
  if (!reg.error && reg.data) reg.data.forEach(function (r) { window.__REGIONS[r.usermail] = { region: r.region, title: r.title }; });

  renderShell();
}

/* ---------- 區別 / 職位（手動指定優先，其次 CSV 對照） ---------- */
function getRegion(email) {
  var o = (window.__REGIONS || {})[email];
  if (o && o.region) return o.region;
  var m = (window.REGION_MAP || {})[email];
  return (m && m.r) || "";
}
function getTitle(email) {
  var o = (window.__REGIONS || {})[email];
  if (o && o.title) return o.title;
  var m = (window.REGION_MAP || {})[email];
  return (m && m.t) || "";
}
function regionRank(region) {
  var i = (window.REGION_LIST || []).indexOf(region);
  return i < 0 ? 9999 : i;  // 未指定 排最後
}
function sortByRegionName(rows) {
  return rows.slice().sort(function (a, b) {
    var ra = regionRank(getRegion(a.usermail)), rb = regionRank(getRegion(b.usermail));
    if (ra !== rb) return ra - rb;
    var na = a.username || "", nb = b.username || "";
    if (na !== nb) return na < nb ? -1 : 1;
    return (a.usermail || "") < (b.usermail || "") ? -1 : 1;
  });
}
function regionFilterHtml(id) {
  var opts = '<option value="__all">全部區別</option>';
  (window.REGION_LIST || []).forEach(function (rg) { opts += '<option value="' + rg + '">' + rg + '</option>'; });
  opts += '<option value="__none">未指定</option>';
  return '<select id="' + id + '" class="admin-search" style="min-width:150px">' + opts + '</select>';
}
function passRegion(email, filterVal) {
  if (!filterVal || filterVal === "__all") return true;
  var r = getRegion(email);
  if (filterVal === "__none") return r === "";
  return r === filterVal;
}
/* 唯讀區別（進度/成績頁用；指定在「學員名單」做） */
function regionTextCell(email) {
  var td = document.createElement("td");
  var r = getRegion(email);
  if (r) { td.textContent = r; }
  else { td.innerHTML = '<span class="region-none">未指定</span>'; }
  return td;
}
/* 可編輯下拉（學員名單用）：field = "region" 或 "title" */
function pickerCell(email, field, list, getVal) {
  var cur = getVal(email);
  var opts = '<option value="">未指定</option>';
  (list || []).forEach(function (v) {
    opts += '<option value="' + v + '"' + (v === cur ? " selected" : "") + '>' + v + '</option>';
  });
  var td = document.createElement("td");
  var sel = document.createElement("select");
  sel.className = "region-sel";
  sel.innerHTML = opts;
  sel.addEventListener("change", function () { setField(email, field, sel.value); });
  td.appendChild(sel);
  return td;
}
function regionSelectCell(email) { return pickerCell(email, "region", window.REGION_LIST, getRegion); }
function titleSelectCell(email) { return pickerCell(email, "title", window.TITLE_LIST, getTitle); }

/* 更新單一欄位（保留另一欄），空值 = 清除手動指定、回到 CSV 對照 */
async function setField(email, field, value) {
  var payload = { usermail: email, updated_at: new Date().toISOString() };
  payload[field] = (value === "" ? null : value);
  var res = await window.sb.from("user_region").upsert(payload, { onConflict: "usermail" });
  if (res.error) { alert("儲存失敗：" + res.error.message); return; }
  if (!window.__REGIONS[email]) window.__REGIONS[email] = {};
  window.__REGIONS[email][field] = (value === "" ? null : value);
}

/* ---------- 分頁框架 ---------- */
function renderShell() {
  var app = document.getElementById("adminApp");
  var view = window.__ADMIN_VIEW || "progress";
  app.innerHTML =
    '<div class="admin-tabs">' +
      '<button class="admin-tab' + (view === "progress" ? " on" : "") + '" data-view="progress">學習進度</button>' +
      '<button class="admin-tab' + (view === "grades" ? " on" : "") + '" data-view="grades">成績管理</button>' +
      '<button class="admin-tab' + (view === "roster" ? " on" : "") + '" data-view="roster">學員名單</button>' +
      '<button class="admin-tab' + (view === "admins" ? " on" : "") + '" data-view="admins">管理者設定</button>' +
    '</div>' +
    '<div id="adminView"></div>';
  app.querySelectorAll(".admin-tab").forEach(function (b) {
    b.addEventListener("click", function () { window.__ADMIN_VIEW = b.getAttribute("data-view"); renderShell(); });
  });
  if (view === "grades") renderGrades();
  else if (view === "roster") renderRoster();
  else if (view === "admins") renderAdmins();
  else renderProgress();
}

function fmtTime(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  var p = function (x) { return (x < 10 ? "0" : "") + x; };
  return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) +
    " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}
function csvCell(s) { s = (s == null ? "" : String(s)); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function downloadCsv(name, lines) {
  var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a"); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ---------- 學習進度 ---------- */
function renderProgress() {
  var el = document.getElementById("adminView");
  var allRows = window.__ADMIN_ROWS || [];
  var users = {};
  allRows.forEach(function (r) { users[r.usermail] = true; });

  var mode = window.__PROG_MODE || "list";
  el.innerHTML =
    '<div class="admin-bar">' +
      '<div class="admin-toggle">' +
        '<button class="seg' + (mode === "list" ? " on" : "") + '" data-mode="list">列表</button>' +
        '<button class="seg' + (mode === "matrix" ? " on" : "") + '" data-mode="matrix">完成度總覽</button>' +
      '</div>' +
      '<div class="admin-tools">' +
        regionFilterHtml("progRegion") +
        '<input id="adminSearch" class="admin-search" type="text" placeholder="搜尋 姓名 / email…" />' +
        '<button id="adminBulkDel" class="btn btn-danger" hidden></button>' +
        '<button id="adminCsv" class="btn btn-primary">匯出 CSV</button>' +
        '<button id="adminReload" class="btn btn-ghost">重新整理</button>' +
      '</div>' +
    '</div>' +
    '<div id="progBody"></div>';

  el.querySelectorAll(".seg").forEach(function (b) {
    b.addEventListener("click", function () { window.__PROG_MODE = b.getAttribute("data-mode"); renderProgress(); });
  });
  document.getElementById("adminSearch").addEventListener("input", drawProgress);
  document.getElementById("progRegion").addEventListener("change", drawProgress);
  document.getElementById("adminReload").addEventListener("click", initAdmin);
  document.getElementById("adminBulkDel").addEventListener("click", bulkDelete);
  document.getElementById("adminCsv").addEventListener("click", function () {
    if ((window.__PROG_MODE || "list") === "matrix") exportMatrix();
    else exportProgressList();
  });

  drawProgress();
}

function currentProgFilter() {
  var q = (document.getElementById("adminSearch").value || "").trim().toLowerCase();
  var rf = document.getElementById("progRegion").value;
  return { q: q, rf: rf };
}

function drawProgress() {
  var mode = window.__PROG_MODE || "list";
  var bulk = document.getElementById("adminBulkDel");
  if (bulk && mode === "matrix") bulk.hidden = true;
  if (mode === "matrix") drawMatrix();
  else drawList();
}

function drawList() {
  var body = document.getElementById("progBody");
  body.innerHTML =
    '<div class="admin-table-wrap"><table class="admin-table">' +
    '<thead><tr><th>區別</th><th>職位</th><th>姓名</th><th>使用者 email</th><th>專案</th><th>步驟</th><th>完成時間</th><th></th></tr></thead>' +
    '<tbody id="adminRows"></tbody></table></div>';
  var f = currentProgFilter();
  var rows = (window.__ADMIN_ROWS || []).filter(function (r) {
    if (!passRegion(r.usermail, f.rf)) return false;
    if (!f.q) return true;
    return ((r.username || "") + " " + r.usermail + " " + r.project + " " + r.step + " " + getRegion(r.usermail) + " " + getTitle(r.usermail)).toLowerCase().indexOf(f.q) !== -1;
  });
  paintRows(sortByRegionName(rows), f.q || (f.rf !== "__all"));
}

/* 完成度矩陣：每位業務一列、每個專案一欄 */
function buildProgIndex() {
  var idx = {};
  (window.__ADMIN_ROWS || []).forEach(function (r) {
    (idx[r.usermail] = idx[r.usermail] || {});
    (idx[r.usermail][r.project] = idx[r.usermail][r.project] || {});
    idx[r.usermail][r.project][r.step] = true;
  });
  return idx;
}
function courseDone(idx, email, course) {
  var m = idx[email] && idx[email][course.title];
  if (!m) return 0;
  var c = 0;
  course.steps.forEach(function (s) { if (m[s.title]) c++; });
  return c;
}
function activeCourses() {
  var list = (typeof COURSES !== "undefined") ? COURSES : [];
  return list.filter(function (c) { return c.available; });
}

function drawMatrix() {
  var body = document.getElementById("progBody");
  var courses = activeCourses();
  var idx = buildProgIndex();
  var f = currentProgFilter();

  var members = buildRoster().filter(function (u) {
    if (!passRegion(u.usermail, f.rf)) return false;
    if (!f.q) return true;
    return ((u.username || "") + " " + u.usermail + " " + getRegion(u.usermail) + " " + getTitle(u.usermail)).toLowerCase().indexOf(f.q) !== -1;
  });
  members = sortByRegionName(members);

  var head = '<tr><th>區別</th><th>姓名</th>';
  courses.forEach(function (c) { head += '<th class="mtx-h">' + c.title + '</th>'; });
  head += '<th class="mtx-h">整體</th></tr>';

  var bodyRows = "";
  members.forEach(function (u) {
    var doneSum = 0, totalSum = 0;
    var cells = "";
    courses.forEach(function (c) {
      var total = c.steps.length;
      var done = courseDone(idx, u.usermail, c);
      doneSum += done; totalSum += total;
      var pct = total ? Math.round(done / total * 100) : 0;
      var cls = done === 0 ? "mtx-zero" : (done >= total ? "mtx-done" : "mtx-part");
      cells += '<td class="mtx-cell ' + cls + '">' +
        '<div class="mtx-bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="mtx-frac">' + done + '/' + total + '</div></td>';
    });
    var opct = totalSum ? Math.round(doneSum / totalSum * 100) : 0;
    cells += '<td class="mtx-cell ' + (opct >= 100 ? "mtx-done" : opct > 0 ? "mtx-part" : "mtx-zero") + '">' +
      '<div class="mtx-bar"><span style="width:' + opct + '%"></span></div>' +
      '<div class="mtx-frac">' + opct + '%</div></td>';
    bodyRows += '<tr><td>' + (getRegion(u.usermail) || '<span class="region-none">未指定</span>') + '</td>' +
      '<td>' + (u.username || u.usermail) + '</td>' + cells + '</tr>';
  });
  if (!members.length) bodyRows = '<tr><td colspan="' + (courses.length + 3) + '" class="admin-empty">沒有資料</td></tr>';

  body.innerHTML = '<div class="admin-table-wrap"><table class="admin-table mtx-table"><thead>' + head + '</thead><tbody>' + bodyRows + '</tbody></table></div>';
}

function exportProgressList() {
  var lines = ["區別,職位,姓名,usermail,專案,步驟,完成時間"];
  sortByRegionName(window.__ADMIN_ROWS || []).forEach(function (r) {
    lines.push([getRegion(r.usermail), getTitle(r.usermail), r.username || "", r.usermail, r.project, r.step, fmtTime(r.completed_at)].map(csvCell).join(","));
  });
  downloadCsv("學習進度.csv", lines);
}
function exportMatrix() {
  var courses = activeCourses();
  var idx = buildProgIndex();
  var header = ["區別", "職位", "姓名", "usermail"].concat(courses.map(function (c) { return c.title; })).concat(["整體完成度"]);
  var lines = [header.map(csvCell).join(",")];
  sortByRegionName(buildRoster()).forEach(function (u) {
    var doneSum = 0, totalSum = 0;
    var cols = courses.map(function (c) {
      var total = c.steps.length, done = courseDone(idx, u.usermail, c);
      doneSum += done; totalSum += total;
      return done + "/" + total;
    });
    var opct = totalSum ? Math.round(doneSum / totalSum * 100) + "%" : "0%";
    var row = [getRegion(u.usermail), getTitle(u.usermail), u.username || "", u.usermail].concat(cols).concat([opct]);
    lines.push(row.map(csvCell).join(","));
  });
  downloadCsv("完成度總覽.csv", lines);
}

function paintRows(rows, filtering) {
  window.__ADMIN_FILTERED = rows;
  var tbody = document.getElementById("adminRows");
  var bulk = document.getElementById("adminBulkDel");
  if (bulk) {
    if (filtering && rows.length) { bulk.hidden = false; bulk.textContent = "🗑 刪除這 " + rows.length + " 筆"; }
    else bulk.hidden = true;
  }
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="8" class="admin-empty">沒有資料</td></tr>'; return; }
  tbody.innerHTML = "";
  rows.forEach(function (r) {
    var tr = document.createElement("tr");
    tr.appendChild(regionTextCell(r.usermail));                     // 區別（唯讀，改在學員名單）
    var tdTitle = document.createElement("td"); tdTitle.textContent = getTitle(r.usermail) || "-"; tr.appendChild(tdTitle);
    [r.username || "", r.usermail, r.project, r.step, fmtTime(r.completed_at)].forEach(function (v) {
      var td = document.createElement("td"); td.textContent = v || ""; tr.appendChild(td);
    });
    var tdAct = document.createElement("td");
    var del = document.createElement("button");
    del.className = "row-del"; del.title = "刪除這筆紀錄"; del.textContent = "🗑";
    del.addEventListener("click", function () { deleteRow(r, tr); });
    tdAct.appendChild(del); tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
}

async function deleteRow(r, tr) {
  var who = (r.username ? r.username + "（" + r.usermail + "）" : r.usermail);
  if (!confirm("確定刪除這筆紀錄嗎？\n\n" + who + "\n" + r.project + " ・ " + r.step)) return;
  var res = await window.sb.from("progress_log").delete().eq("id", r.id);
  if (res.error) { alert("刪除失敗：" + res.error.message); return; }
  window.__ADMIN_ROWS = (window.__ADMIN_ROWS || []).filter(function (x) { return x.id !== r.id; });
  window.__ADMIN_FILTERED = (window.__ADMIN_FILTERED || []).filter(function (x) { return x.id !== r.id; });
  if (tr && tr.parentNode) tr.parentNode.removeChild(tr);
  refreshStats();
}
async function bulkDelete() {
  var rows = window.__ADMIN_FILTERED || [];
  if (!rows.length) return;
  if (!confirm("確定要刪除目前列出的 " + rows.length + " 筆紀錄嗎？\n此動作無法復原。")) return;
  var ids = rows.map(function (r) { return r.id; });
  var res = await window.sb.from("progress_log").delete().in("id", ids);
  if (res.error) { alert("刪除失敗：" + res.error.message); return; }
  alert("已刪除 " + rows.length + " 筆紀錄。");
  initAdmin();
}
function refreshStats() {
  var allRows = window.__ADMIN_ROWS || [];
  var users = {}; allRows.forEach(function (r) { users[r.usermail] = true; });
  var stats = document.querySelectorAll(".admin-stats .stat b");
  if (stats.length >= 2) { stats[0].textContent = Object.keys(users).length; stats[1].textContent = allRows.length; }
}

/* ---------- 成績管理 ---------- */
function renderGrades() {
  var el = document.getElementById("adminView");
  var quizRows = (window.__ADMIN_ROWS || []).filter(function (r) { return r.step === "作測驗"; });
  var seen = {}, list = [];
  quizRows.forEach(function (r) { var k = r.usermail + "||" + r.project; if (!seen[k]) { seen[k] = true; list.push(r); } });
  window.__GRADE_LIST = list;

  el.innerHTML =
    '<div class="admin-bar">' +
      '<div class="admin-stats"><span class="stat"><b>' + list.length + '</b> 筆待/已評分</span></div>' +
      '<div class="admin-tools">' +
        regionFilterHtml("gradeRegion") +
        '<input id="gradeSearch" class="admin-search" type="text" placeholder="搜尋 姓名 / email / 課程…" />' +
        '<button id="gradeCsv" class="btn btn-primary">匯出成績 CSV</button>' +
        '<button id="gradeReload" class="btn btn-ghost">重新整理</button>' +
      '</div>' +
    '</div>' +
    '<p class="grade-hint">💡 在「分數」欄填入成績後，業務就能在平台看到；留空則顯示「未公佈」。「區別」可直接下拉指定（新人用）。</p>' +
    '<div class="admin-table-wrap"><table class="admin-table">' +
      '<thead><tr><th>區別</th><th>職位</th><th>姓名</th><th>使用者 email</th><th>課程</th><th style="width:150px">分數</th><th>狀態</th></tr></thead>' +
      '<tbody id="gradeRows"></tbody>' +
    '</table></div>';

  function apply() {
    var q = (document.getElementById("gradeSearch").value || "").trim().toLowerCase();
    var rf = document.getElementById("gradeRegion").value;
    var rows = list.filter(function (r) {
      if (!passRegion(r.usermail, rf)) return false;
      if (!q) return true;
      return ((r.username || "") + " " + r.usermail + " " + r.project + " " + getRegion(r.usermail) + " " + getTitle(r.usermail)).toLowerCase().indexOf(q) !== -1;
    });
    paintGrades(sortByRegionName(rows));
  }
  paintGrades(sortByRegionName(list));
  document.getElementById("gradeSearch").addEventListener("input", apply);
  document.getElementById("gradeRegion").addEventListener("change", apply);
  document.getElementById("gradeCsv").addEventListener("click", exportGrades);
  document.getElementById("gradeReload").addEventListener("click", initAdmin);
}

function paintGrades(list) {
  var tbody = document.getElementById("gradeRows");
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">目前還沒有人完成測驗</td></tr>'; return; }
  tbody.innerHTML = "";
  list.forEach(function (r) {
    var key = r.usermail + "||" + r.project;
    var cur = window.__GRADES[key];
    var tr = document.createElement("tr");

    tr.appendChild(regionTextCell(r.usermail));                     // 區別（唯讀）
    var tdTitle = document.createElement("td"); tdTitle.textContent = getTitle(r.usermail) || "-"; tr.appendChild(tdTitle);
    [r.username || "", r.usermail, r.project].forEach(function (v) {
      var td = document.createElement("td"); td.textContent = v || ""; tr.appendChild(td);
    });

    var tdScore = document.createElement("td");
    var input = document.createElement("input");
    input.className = "grade-input"; input.type = "text"; input.placeholder = "填入分數"; input.value = (cur != null ? cur : "");
    tdScore.appendChild(input); tr.appendChild(tdScore);

    var tdState = document.createElement("td"); tdState.className = "grade-state";
    tdState.innerHTML = (cur != null && cur !== "") ? '<span class="pill pill-done">已公佈</span>' : '<span class="pill pill-locked">未公佈</span>';
    tr.appendChild(tdState);

    input.addEventListener("change", function () { saveGrade(r, input.value.trim(), tdState); });
    tbody.appendChild(tr);
  });
}

async function saveGrade(r, score, tdState) {
  var key = r.usermail + "||" + r.project;
  if (score === "") {
    var d = await window.sb.from("grades").delete().eq("usermail", r.usermail).eq("project", r.project);
    if (d.error) { alert("儲存失敗：" + d.error.message); return; }
    delete window.__GRADES[key];
    tdState.innerHTML = '<span class="pill pill-locked">未公佈</span>';
    return;
  }
  var res = await window.sb.from("grades").upsert(
    { usermail: r.usermail, username: r.username || null, project: r.project, score: score, updated_at: new Date().toISOString() },
    { onConflict: "usermail,project" });
  if (res.error) { alert("儲存失敗：" + res.error.message); return; }
  window.__GRADES[key] = score;
  tdState.innerHTML = '<span class="pill pill-done">已公佈 ✓</span>';
}

function exportGrades() {
  var list = window.__GRADE_LIST || [];
  var lines = ["區別,職位,姓名,usermail,課程,分數,狀態"];
  sortByRegionName(list).forEach(function (r) {
    var s = window.__GRADES[r.usermail + "||" + r.project];
    lines.push([getRegion(r.usermail), getTitle(r.usermail), r.username || "", r.usermail, r.project, (s != null ? s : ""), (s != null && s !== "" ? "已公佈" : "未公佈")].map(csvCell).join(","));
  });
  downloadCsv("測驗成績.csv", lines);
}

/* ---------- 學員名單（一人一列，在此指定區別） ---------- */
function buildRoster() {
  var map = {};
  (window.__ADMIN_ROWS || []).forEach(function (r) {
    if (!map[r.usermail]) map[r.usermail] = { usermail: r.usermail, username: r.username || "", count: 0 };
    map[r.usermail].count++;
    if (!map[r.usermail].username && r.username) map[r.usermail].username = r.username;
  });
  return Object.keys(map).map(function (k) { return map[k]; });
}
function renderRoster() {
  var el = document.getElementById("adminView");
  var list = buildRoster();
  window.__ROSTER = list;

  el.innerHTML =
    '<div class="admin-bar">' +
      '<div class="admin-stats"><span class="stat"><b>' + list.length + '</b> 位使用者</span></div>' +
      '<div class="admin-tools">' +
        regionFilterHtml("rosterRegion") +
        '<input id="rosterSearch" class="admin-search" type="text" placeholder="搜尋 姓名 / email…" />' +
        '<button id="rosterCsv" class="btn btn-primary">匯出名單 CSV</button>' +
        '<button id="rosterReload" class="btn btn-ghost">重新整理</button>' +
      '</div>' +
    '</div>' +
    '<p class="grade-hint">💡 這裡一位使用者一列，在「區別」欄指定一次即可（已在對照表的會自動帶入）。此設定會套用到「學習進度」「成績管理」的區別顯示與篩選。</p>' +
    '<div class="admin-table-wrap"><table class="admin-table">' +
      '<thead><tr><th style="width:150px">區別</th><th style="width:120px">職位</th><th>姓名</th><th>使用者 email</th><th>完成紀錄</th></tr></thead>' +
      '<tbody id="rosterRows"></tbody>' +
    '</table></div>';

  function apply() {
    var q = (document.getElementById("rosterSearch").value || "").trim().toLowerCase();
    var rf = document.getElementById("rosterRegion").value;
    var rows = list.filter(function (u) {
      if (!passRegion(u.usermail, rf)) return false;
      if (!q) return true;
      return ((u.username || "") + " " + u.usermail + " " + getRegion(u.usermail) + " " + getTitle(u.usermail)).toLowerCase().indexOf(q) !== -1;
    });
    paintRoster(sortByRegionName(rows));
  }
  paintRoster(sortByRegionName(list));
  document.getElementById("rosterSearch").addEventListener("input", apply);
  document.getElementById("rosterRegion").addEventListener("change", apply);
  document.getElementById("rosterReload").addEventListener("click", initAdmin);
  document.getElementById("rosterCsv").addEventListener("click", function () {
    var lines = ["區別,職位,姓名,usermail,完成紀錄數"];
    sortByRegionName(list).forEach(function (u) {
      lines.push([getRegion(u.usermail), getTitle(u.usermail), u.username || "", u.usermail, u.count].map(csvCell).join(","));
    });
    downloadCsv("學員名單.csv", lines);
  });
}
function paintRoster(list) {
  var tbody = document.getElementById("rosterRows");
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">目前還沒有使用者</td></tr>'; return; }
  tbody.innerHTML = "";
  list.forEach(function (u) {
    var tr = document.createElement("tr");
    tr.appendChild(regionSelectCell(u.usermail));                      // 區別（可改）
    tr.appendChild(titleSelectCell(u.usermail));                       // 職位（可改）
    var tdName = document.createElement("td"); tdName.textContent = u.username || ""; tr.appendChild(tdName);
    var tdMail = document.createElement("td"); tdMail.textContent = u.usermail; tr.appendChild(tdMail);
    var tdCnt = document.createElement("td"); tdCnt.textContent = u.count + " 筆"; tr.appendChild(tdCnt);
    tbody.appendChild(tr);
  });
}

/* ---------- 管理者設定 ---------- */
function renderAdmins() {
  var el = document.getElementById("adminView");
  var cfg = window.APP_CONFIG || {};
  el.innerHTML =
    '<p class="grade-hint">💡 在這裡新增／移除可進入後台的 email（限 @' + cfg.ALLOWED_DOMAIN + '）。' +
      '所有管理者權限相同。擁有者帳號無法被移除，以免鎖死後台。</p>' +
    '<div class="admin-add">' +
      '<input id="newAdmin" class="admin-search" type="text" placeholder="輸入 email，例如 someone@' + cfg.ALLOWED_DOMAIN + '" />' +
      '<button id="addAdminBtn" class="btn btn-primary">新增管理者</button>' +
    '</div>' +
    '<div class="admin-table-wrap"><table class="admin-table">' +
      '<thead><tr><th>可進入後台的 email</th><th style="width:120px"></th></tr></thead>' +
      '<tbody id="adminList"></tbody>' +
    '</table></div>';
  paintAdmins();
  document.getElementById("addAdminBtn").addEventListener("click", addAdmin);
  document.getElementById("newAdmin").addEventListener("keydown", function (e) { if (e.key === "Enter") addAdmin(); });
}
function paintAdmins() {
  var tbody = document.getElementById("adminList");
  var list = window.__ADMINS || [];
  var cfg = window.APP_CONFIG || {};
  var me = (window.CURRENT_USER || "").toLowerCase();
  var owner = (cfg.OWNER_EMAIL || "").toLowerCase();
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="2" class="admin-empty">沒有資料</td></tr>'; return; }
  tbody.innerHTML = "";
  list.forEach(function (email) {
    var low = email.toLowerCase();
    var tr = document.createElement("tr");
    var tdMail = document.createElement("td"); tdMail.textContent = email;
    if (low === owner) { var t = document.createElement("span"); t.className = "pill pill-current"; t.style.marginLeft = "8px"; t.textContent = "擁有者"; tdMail.appendChild(t); }
    else if (low === me) { var t2 = document.createElement("span"); t2.className = "pill pill-done"; t2.style.marginLeft = "8px"; t2.textContent = "你"; tdMail.appendChild(t2); }
    tr.appendChild(tdMail);
    var tdAct = document.createElement("td");
    if (low !== owner) {
      var del = document.createElement("button");
      del.className = "btn btn-ghost"; del.style.padding = "6px 14px"; del.style.fontSize = "13px"; del.textContent = "移除";
      del.addEventListener("click", function () { removeAdmin(email); });
      tdAct.appendChild(del);
    }
    tr.appendChild(tdAct); tbody.appendChild(tr);
  });
}
async function addAdmin() {
  var input = document.getElementById("newAdmin");
  var cfg = window.APP_CONFIG || {};
  var email = (input.value || "").trim().toLowerCase();
  if (!email) return;
  if (email.slice(-(cfg.ALLOWED_DOMAIN.length + 1)) !== ("@" + cfg.ALLOWED_DOMAIN)) { alert("只能新增 @" + cfg.ALLOWED_DOMAIN + " 的公司帳號。"); return; }
  if ((window.__ADMINS || []).some(function (e) { return e.toLowerCase() === email; })) { alert("這個 email 已經是管理者了。"); return; }
  var res = await window.sb.from("admins").insert({ email: email });
  if (res.error) { alert("新增失敗：" + res.error.message); return; }
  window.__ADMINS.push(email); window.__ADMINS.sort(); input.value = ""; paintAdmins();
}
async function removeAdmin(email) {
  var cfg = window.APP_CONFIG || {};
  if (email.toLowerCase() === (cfg.OWNER_EMAIL || "").toLowerCase()) { alert("擁有者帳號不可移除。"); return; }
  if (!confirm("確定要移除這位管理者嗎？\n\n" + email + "\n移除後他將無法再進入後台。")) return;
  var res = await window.sb.from("admins").delete().eq("email", email);
  if (res.error) { alert("移除失敗：" + res.error.message); return; }
  window.__ADMINS = (window.__ADMINS || []).filter(function (e) { return e !== email; });
  paintAdmins();
}
