/* =========================================================
   後台：檢視所有人的學習進度（僅限管理者白名單）
   由 auth.js 在登入成功後呼叫 initAdmin()
   - 可搜尋、匯出 CSV
   - 可刪除單筆，或批次刪除「目前搜尋結果」（測試清理用）
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
    .select("id, usermail, username, project, step, completed_at")
    .order("completed_at", { ascending: false });
  if (res.error) {
    app.innerHTML = '<div class="admin-denied">讀取失敗：' + res.error.message + '</div>';
    return;
  }

  window.__ADMIN_ROWS = res.data || [];
  renderAdmin();
}

function fmtTime(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  var p = function (x) { return (x < 10 ? "0" : "") + x; };
  return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) +
    " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}

function renderAdmin() {
  var app = document.getElementById("adminApp");
  var allRows = window.__ADMIN_ROWS || [];
  var users = {};
  allRows.forEach(function (r) { users[r.usermail] = true; });

  app.innerHTML =
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
      return ((r.username || "") + " " + r.usermail + " " + r.project + " " + r.step)
        .toLowerCase().indexOf(q) !== -1;
    });
    paintRows(filtered, q);
  });
  document.getElementById("adminCsv").addEventListener("click", exportCsv);
  document.getElementById("adminReload").addEventListener("click", initAdmin);
  document.getElementById("adminBulkDel").addEventListener("click", bulkDelete);
}

function paintRows(rows, query) {
  window.__ADMIN_FILTERED = rows;
  var tbody = document.getElementById("adminRows");

  // 批次刪除鈕：只有「有搜尋條件」時才出現，避免手滑清空全部
  var bulk = document.getElementById("adminBulkDel");
  if (bulk) {
    if (query && rows.length) {
      bulk.hidden = false;
      bulk.textContent = "🗑 刪除這 " + rows.length + " 筆";
    } else {
      bulk.hidden = true;
    }
  }

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">沒有資料</td></tr>';
    return;
  }
  tbody.innerHTML = "";
  rows.forEach(function (r) {
    var tr = document.createElement("tr");
    // 用 textContent 塞值，避免任何注入
    [r.username || "", r.usermail, r.project, r.step, fmtTime(r.completed_at)].forEach(function (v) {
      var td = document.createElement("td");
      td.textContent = v || "";
      tr.appendChild(td);
    });
    var tdAct = document.createElement("td");
    var del = document.createElement("button");
    del.className = "row-del";
    del.title = "刪除這筆紀錄";
    del.textContent = "🗑";
    del.addEventListener("click", function () { deleteRow(r, tr); });
    tdAct.appendChild(del);
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
}

/* 刪除單筆 */
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

/* 批次刪除「目前搜尋結果」 */
async function bulkDelete() {
  var rows = window.__ADMIN_FILTERED || [];
  if (!rows.length) return;
  if (!confirm("確定要刪除目前搜尋出來的 " + rows.length + " 筆紀錄嗎？\n此動作無法復原。")) return;

  var ids = rows.map(function (r) { return r.id; });
  var res = await window.sb.from("progress_log").delete().in("id", ids);
  if (res.error) { alert("刪除失敗：" + res.error.message); return; }

  alert("已刪除 " + rows.length + " 筆紀錄。");
  initAdmin();  // 重新載入
}

/* 刪除後更新上方統計數字 */
function refreshStats() {
  var allRows = window.__ADMIN_ROWS || [];
  var users = {};
  allRows.forEach(function (r) { users[r.usermail] = true; });
  var stats = document.querySelectorAll(".admin-stats .stat b");
  if (stats.length >= 2) {
    stats[0].textContent = Object.keys(users).length;
    stats[1].textContent = allRows.length;
  }
}

function exportCsv() {
  var rows = window.__ADMIN_ROWS || [];
  var cell = function (s) {
    s = (s == null ? "" : String(s));
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  var lines = ["姓名,usermail,專案,步驟,完成時間"];
  rows.forEach(function (r) {
    lines.push([r.username || "", r.usermail, r.project, r.step, fmtTime(r.completed_at)].map(cell).join(","));
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
