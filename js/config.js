/* =========================================================
   平台設定檔
   ---------------------------------------------------------
   建好 Supabase 專案後，把「Project URL」與「anon public key」
   填到下面兩行（詳見「部署設定指南.md」）。
   anon key 是公開金鑰、可以放在前端，真正的權限由資料庫的
   RLS 規則把關（使用者只能寫自己的 email、且必須是公司網域）。
   ========================================================= */
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",   // ← 換成你的 Project URL
  SUPABASE_ANON_KEY: "YOUR-ANON-PUBLIC-KEY",          // ← 換成你的 anon public key
  ALLOWED_DOMAIN: "hanlin.com.tw"                       // 只允許這個網域的 Google 帳號登入
};
