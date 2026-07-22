/* =========================================================
   後台（僅限管理者白名單）：兩個分頁
   - 學習進度：看全員進度、搜尋、匯出、刪除
   - 成績管理：對已完成測驗者填分數、匯出
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

  var pr = await window.sb
    .from("progress_log")
    .select("id, usermail, username, project, step, completed_at")
    .order("completed_at", { ascending: false });
  if (pr.error) { app.innerHTML = '<div class="admin-denied">讀取失敗：' + pr.error.message + '</div>'; return; }
  window.__ADMIN_ROWS = pr.data || [];

  var gr = await window.sb.from("grades").select("usermail, username, project, score");
  window.__GRADES = {};
  if (!gr.error && gr.data) gr.data.forEach(function (r) { window.__GRADES[r.usermail + "||" + r.project] = r.score; });

  var ad = await window.sb.from("admins").select("email").order("email");
  window.__ADMINS = (!ad.error && ad.data) ? ad.data.map(function (r) { return r.email; }) : [];

  renderShell();
}

function renderShell() {
  var app = document.getElementById("adminApp");
  var view = window.__ADMIN_VIEW || "progress";
  app.innerHTML =
    '<div class="admin-tabs">' +
      '<button class="admin-tab' + (view === "progress" ? " on" : "") + '" data-view="progress">學習進度</button>' +
      '<button class="admin-tab' + (view === "grades" ? " on" : "") + '" data-view="grades">成績管理</button>' +
      '<button class="admin-tab' + (view === "admins" ? " on" : "") + '" data-view="admins">管理者設定</button>' +
    '</div>' +
    '<div id="adminView"></div>';
  app.querySelectorAll(".admin-tab").forEach(function (b) {
    b.addEventListener("click", function () {
      window.__ADMIN_VIEW = b.getAttribute("data-view");
      renderShell();
    });
  });
  if (view === "grades") renderGrades();
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

function csvCell(s) {
  s = (s == null ? "" : String(s));
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function downloadCsv(name, lines) {
  var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- 學習進度 ---------- */
function renderProgress() {
  var el = document.getElementById("adminView");
  var allRows = window.__ADMIN_ROWS || [];
  var users = {};
  allRows.forEach(function (r) { users[r.usermail] = true; });

  el.innerHTML =
    '<div class="admin-bar">' +
      '<div class="admin-stats">' +
        '<span class="stat"><b>' + Object.keys(users).length + '</b> 位使用者</span>' +
        '<span class="stat"><b>' + allRows.length + '</b> 筆完成紀錄</span>' +
      '</div>' +
      '<div class="admin-tools">' +
        '<input id="adminSearch" class="admin-search" type="text" placeholder="搜尋 姓名 / email / 專案 / 步驟…" />' +
        '<button id="adminBulkDel" class="btn btn-danger" hidden></button>' +
        '<button id="adminCsv" class="btn btn-primary">匯出 CSV</button>' +
        '<button id="adminReload" class="btn btn-ghost">重新整理</button>' +
      '</div>' +
    '</div>' +
    '<div class="admin-table-wrap"><table class="admin-table">' +
      '<thead><tr><th>姓名</th><th>使用者 email</th><th>專案</th><th>步驟</th><th>完成時間</th><th></th></tr></thead>' +
      '<tbody id="adminRows"></tbody>' +
    '</table></div>';

  paintRows(allRows);
  document.getElementById("adminSearch").addEventListener("input", function (e) {
    var q = e.target.value.trim().toLowerCase();
    var filtered = !q ? window.__ADMIN_ROWS : window.__ADMIN_ROWS.filter(function (r) {
      return ((r.username || "") + " " + r.usermail + " " + r.project + " " + r.step).toLowerCase().indexOf(q) !== -1;
    });
    paintRows(filtered, q);
  });
  document.getElementById("adminCsv").addEventListener("click", function () {
    var lines = ["姓名,usermail,專案,步驟,完成時間"];
    (window.__ADMIN_ROWS || []).forEach(function (r) {
      lines.push([r.username || "", r.usermail, r.project, r.step, fmtTime(r.completed_at)].map(csvCell).join(","));
    });
    downloadCsv("學習進度.csv", lines);
  });
  document.getElementById("adminReload").addEventListener("click", initAdmin);
  document.getElementById("adminBulkDel").addEventListener("click", bulkDelete);
}

function paintRows(rows, query) {
  window.__ADMIN_FILTERED = rows;
  var tbody = document.getElementById("adminRows");
  var bulk = document.getElementById("adminBulkDel");
  if (bulk) {
    if (query && rows.length) { bulk.hidden = false; bulk.textContent = "🗑 刪除這 " + rows.length + " 筆"; }
    else bulk.hidden = true;
  }
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">沒有資料</td></tr>'; return; }
  tbody.innerHTML = "";
  rows.forEach(function (r) {
    var tr = document.createElement("tr");
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
  if (!confirm("確定要刪除目前搜尋出來的 " + rows.length + " 筆紀錄嗎？\n此動作無法復原。")) return;
  var ids = rows.map(function (r) { return r.id; });
  var res = await window.sb.from("progress_log").delete().in("id", ids);
  if (res.error) { alert("刪除失敗：" + res.error.message); return; }
  alert("已刪除 " + rows.length + " 筆紀錄。");
  initAdmin();
}

function refreshStats() {
  var allRows = window.__ADMIN_ROWS || [];
  var users = {};
  allRows.forEach(function (r) { users[r.usermail] = true; });
  var stats = document.querySelectorAll(".admin-stats .stat b");
  if (stats.length >= 2) { stats[0].textContent = Object.keys(users).length; stats[1].textContent = allRows.length; }
}

/* ---------- 成績管理 ---------- */
function renderGrades() {
  var el = document.getElementById("adminView");
  // 「完成測驗」的人 = progress_log 中 step 為「作測驗」的紀錄
  var quizRows = (window.__ADMIN_ROWS || []).filter(function (r) { return r.step === "作測驗"; });
  // 依 email + 專案 去重（保留最新）
  var seen = {}, list = [];
  quizRows.forEach(function (r) {
    var k = r.usermail + "||" + r.project;
    if (!seen[k]) { seen[k] = true; list.push(r); }
  });

  el.innerHTML =
    '<div class="admin-bar">' +
      '<div class="admin-stats"><span class="stat"><b>' + list.length + '</b> 筆待/已評分</span></div>' +
      '<div class="admin-tools">' +
        '<input id="gradeSearch" class="admin-search" type="text" placeholder="搜尋 姓名 / email / 課程…" />' +
        '<button id="gradeCsv" class="btn btn-primary">匯出成績 CSV</button>' +
        '<button id="gradeReload" class="btn btn-ghost">重新整理</button>' +
      '</div>' +
    '</div>' +
    '<p class="grade-hint">💡 在「分數」欄填入成績後，業務就能在平台看到；留空則顯示「未公佈」。填完點欄位外自動儲存。</p>' +
    '<div class="admin-table-wrap"><table class="admin-table">' +
      '<thead><tr><th>姓名</th><th>使用者 email</th><th>課程</th><th style="width:180px">分數</th><th>狀態</th></tr></thead>' +
      '<tbody id="gradeRows"></tbody>' +
    '</table></div>';

  window.__GRADE_LIST = list;
  paintGrades(list);
  document.getElementById("gradeSearch").addEventListener("input", function (e) {
    var q = e.target.value.trim().toLowerCase();
    var f = !q ? list : list.filter(function (r) {
      return ((r.username || "") + " " + r.usermail + " " + r.project).toLowerCase().indexOf(q) !== -1;
    });
    paintGrades(f);
  });
  document.getElementById("gradeCsv").addEventListener("click", exportGrades);
  document.getElementById("gradeReload").addEventListener("click", initAdmin);
}

function paintGrades(list) {
  var tbody = document.getElementById("gradeRows");
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">目前還沒有人完成測驗</td></tr>'; return; }
  tbody.innerHTML = "";
  list.forEach(function (r) {
    var key = r.usermail + "||" + r.project;
    var cur = window.__GRADES[key];
    var tr = document.createElement("tr");

    [r.username || "", r.usermail, r.project].forEach(function (v) {
      var td = document.createElement("td"); td.textContent = v || ""; tr.appendChild(td);
    });

    var tdScore = document.createElement("td");
    var input = document.createElement("input");
    input.className = "grade-input"; input.type = "text";
    input.placeholder = "填入分數"; input.value = (cur != null ? cur : "");
    tdScore.appendChild(input); tr.appendChild(tdScore);

    var tdState = document.createElement("td");
    tdState.className = "grade-state";
    tdState.innerHTML = (cur != null && cur !== "") ? '<span class="pill pill-done">已公佈</span>' : '<span class="pill pill-locked">未公佈</span>';
    tr.appendChild(tdState);

    input.addEventListener("change", function () { saveGrade(r, input.value.trim(), tdState); });
    tbody.appendChild(tr);
  });
}

async function saveGrade(r, score, tdState) {
  var key = r.usermail + "||" + r.project;
  if (score === "") {
    // 清空 → 刪除該成績（回到未公佈）
    var d = await window.sb.from("grades").delete().eq("usermail", r.usermail).eq("project", r.project);
    if (d.error) { alert("儲存失敗：" + d.error.message); return; }
    delete window.__GRADES[key];
    tdState.innerHTML = '<span class="pill pill-locked">未公佈</span>';
    return;
  }
  var res = await window.sb.from("grades").upsert(
    { usermail: r.usermail, username: r.username || null, project: r.project, score: score, updated_at: new Date().toISOString() },
    { onConflict: "usermail,project" }
  );
  if (res.error) { alert("儲存失敗：" + res.error.message); return; }
  window.__GRADES[key] = score;
  tdState.innerHTML = '<span class="pill pill-done">已公佈 ✓</span>';
}

function exportGrades() {
  var list = window.__GRADE_LIST || [];
  var lines = ["姓名,usermail,課程,分數,狀態"];
  list.forEach(function (r) {
    var s = window.__GRADES[r.usermail + "||" + r.project];
    lines.push([r.username || "", r.usermail, r.project, (s != null ? s : ""), (s != null && s !== "" ? "已公佈" : "未公佈")].map(csvCell).join(","));
  });
  downloadCsv("測驗成績.csv", lines);
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
  document.getElementById("newAdmin").addEventListener("keydown", function (e) {
    if (e.key === "Enter") addAdmin();
  });
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

    var tdMail = document.createElement("td");
    tdMail.textContent = email;
    if (low === owner) {
      var tag = document.createElement("span");
      tag.className = "pill pill-current"; tag.style.marginLeft = "8px"; tag.textContent = "擁有者";
      tdMail.appendChild(tag);
    } else if (low === me) {
      var t2 = document.createElement("span");
      t2.className = "pill pill-done"; t2.style.marginLeft = "8px"; t2.textContent = "你";
      tdMail.appendChild(t2);
    }
    tr.appendChild(tdMail);

    var tdAct = document.createElement("td");
    if (low !== owner) {   // 擁有者不可移除
      var del = document.createElement("button");
      del.className = "btn btn-ghost"; del.style.padding = "6px 14px"; del.style.fontSize = "13px";
      del.textContent = "移除";
      del.addEventListener("click", function () { removeAdmin(email); });
      tdAct.appendChild(del);
    }
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
}

async function addAdmin() {
  var input = document.getElementById("newAdmin");
  var cfg = window.APP_CONFIG || {};
  var email = (input.value || "").trim().toLowerCase();
  if (!email) return;
  if (email.slice(-(cfg.ALLOWED_DOMAIN.length + 1)) !== ("@" + cfg.ALLOWED_DOMAIN)) {
    alert("只能新增 @" + cfg.ALLOWED_DOMAIN + " 的公司帳號。");
    return;
  }
  if ((window.__ADMINS || []).some(function (e) { return e.toLowerCase() === email; })) {
    alert("這個 email 已經是管理者了。");
    return;
  }
  var res = await window.sb.from("admins").insert({ email: email });
  if (res.error) { alert("新增失敗：" + res.error.message); return; }
  window.__ADMINS.push(email);
  window.__ADMINS.sort();
  input.value = "";
  paintAdmins();
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
