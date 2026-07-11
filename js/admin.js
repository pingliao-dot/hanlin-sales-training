/* =========================================================
   後台：檢視所有人的學習進度（僅限管理者白名單）
   由 auth.js 在登入成功後呼叫 initAdmin()
   ========================================================= */
async function initAdmin() {
  var app = document.getElementById("adminApp");
  if (!app) return;
  app.innerHTML = '<p class="admin-loading">載入中…</p>';

  // 1) 確認是不是管理者
  var chk = await window.sb.rpc("is_admin");
  if (chk.error || !chk.data) {
    app.innerHTML =
      '<div class="admin-denied">🔒 你沒有後台檢視權限。<br>' +
      '如需開通，請將你的 email 加入 Supabase 的 <code>admins</code> 資料表。</div>';
    return;
  }

  // 2) 撈全部紀錄
  var res = await window.sb
    .from("progress_log")
    .select("usermail, project, step, completed_at")
    .order("completed_at", { ascending: false });
  if (res.error) {
    app.innerHTML = '<div class="admin-denied">讀取失敗：' + res.error.message + '</div>';
    return;
  }

  window.__ADMIN_ROWS = res.data || [];
  renderAdmin(window.__ADMIN_ROWS);
}

function fmtTime(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  var p = function (x) { return (x < 10 ? "0" : "") + x; };
  return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) +
    " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

function renderAdmin(allRows) {
  var app = document.getElementById("adminApp");
  var users = {};
  allRows.forEach(function (r) { users[r.usermail] = true; });

  app.innerHTML =
    '<div class="admin-bar">' +
      '<div class="admin-stats">' +
        '<span class="stat"><b>' + Object.keys(users).length + '</b> 位使用者</span>' +
        '<span class="stat"><b>' + allRows.length + '</b> 筆完成紀錄</span>' +
      '</div>' +
      '<div class="admin-tools">' +
        '<input id="adminSearch" class="admin-search" type="text" placeholder="搜尋 email / 專案 / 步驟…" />' +
        '<button id="adminCsv" class="btn btn-primary">匯出 CSV</button>' +
        '<button id="adminReload" class="btn btn-ghost">重新整理</button>' +
      '</div>' +
    '</div>' +
    '<div class="admin-table-wrap"><table class="admin-table">' +
      '<thead><tr><th>使用者 email</th><th>專案</th><th>步驟</th><th>完成時間</th></tr></thead>' +
      '<tbody id="adminRows"></tbody>' +
    '</table></div>';

  paintRows(allRows);

  document.getElementById("adminSearch").addEventListener("input", function (e) {
    var q = e.target.value.trim().toLowerCase();
    var filtered = !q ? window.__ADMIN_ROWS : window.__ADMIN_ROWS.filter(function (r) {
      return (r.usermail + " " + r.project + " " + r.step).toLowerCase().indexOf(q) !== -1;
    });
    paintRows(filtered);
  });
  document.getElementById("adminCsv").addEventListener("click", exportCsv);
  document.getElementById("adminReload").addEventListener("click", initAdmin);
}

function paintRows(rows) {
  var tbody = document.getElementById("adminRows");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="admin-empty">沒有資料</td></tr>';
    return;
  }
  tbody.innerHTML = "";
  rows.forEach(function (r) {
    var tr = document.createElement("tr");
    // 用 textContent 塞值，避免任何注入
    [r.usermail, r.project, r.step, fmtTime(r.completed_at)].forEach(function (v) {
      var td = document.createElement("td");
      td.textContent = v || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function exportCsv() {
  var rows = window.__ADMIN_ROWS || [];
  var cell = function (s) {
    s = (s == null ? "" : String(s));
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  var lines = ["usermail,專案,步驟,完成時間"];
  rows.forEach(function (r) {
    lines.push([r.usermail, r.project, r.step, fmtTime(r.completed_at)].map(cell).join(","));
  });
  var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "學習進度.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
