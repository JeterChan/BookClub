# language: zh-TW
功能: Google OAuth 社交登入
  作為一個用戶
  我想要使用 Google 帳號登入
  以便我可以更方便地訪問平台

  背景:
    假設 API 端點是 "http://localhost:3001/api"
    而且 Google OAuth 服務可用

  場景: 首次 Google 登入建立新帳號
    假設 我在登入頁面
    而且 資料庫中不存在 Google ID "google123"
    當 我點擊"使用 Google 登入"按鈕
    而且 Google 返回用戶資訊:
      | googleId  | email            | name     |
      | google123 | john@gmail.com   | John Doe |
    那麼 系統應該建立新用戶:
      | email          | displayName | googleId  | oauthProvider | isActive |
      | john@gmail.com | John Doe    | google123 | google        | true     |
    而且 我應該收到 accessToken
    而且 回應應該包含 "isNewUser": true
    而且 回應應該包含 "needsDisplayName": false

  場景: 使用 API 首次 Google 登入
    當 我發送 POST 請求到 "/auth/google/login" 帶著:
      """json
      {
        "idToken": "valid-google-id-token"
      }
      """
    而且 Google 驗證返回:
      | googleId  | email            | name |
      | google456 | test@gmail.com   | null |
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 JSON:
      """json
      {
        "accessToken": "<string>",
        "tokenType": "bearer",
        "isNewUser": true,
        "needsDisplayName": true
      }
      """
    而且 資料庫應該包含新用戶 "test@gmail.com"
    而且 用戶的 "googleId" 應該是 "google456"
    而且 用戶的 "oauthProvider" 應該是 "google"
    而且 用戶不應該有 "passwordHash"

  場景: 已有帳號的 Google 登入
    假設 資料庫已存在用戶:
      | email          | googleId  | oauthProvider | displayName | isActive |
      | john@gmail.com | google123 | google        | John Doe    | true     |
    當 我發送 POST 請求到 "/auth/google/login" 帶著有效的 Google ID token
    而且 Google 返回 googleId "google123"
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 "isNewUser": false
    而且 回應應該包含 "needsDisplayName": false
    而且 我應該收到有效的 accessToken

  場景: 綁定 Google 帳號到現有帳號
    假設 我已登入為 "john@example.com"
    而且 我的帳號沒有綁定 Google
    當 我發送 POST 請求到 "/users/me/link-google" 帶著:
      """json
      {
        "idToken": "valid-google-id-token"
      }
      """
    而且 Google 返回 googleId "google789"
    那麼 回應狀態碼應該是 200
    而且 資料庫中用戶 "john@example.com" 的 "googleId" 應該是 "google789"
    而且 資料庫中用戶 "john@example.com" 的 "oauthProvider" 應該是 "google"

  場景: 嘗試綁定已被使用的 Google 帳號
    假設 我已登入為 "john@example.com"
    而且 Google ID "google123" 已被其他用戶使用
    當 我嘗試綁定 Google ID "google123"
    那麼 回應狀態碼應該是 400
    而且 回應應該包含錯誤訊息 "Google account already linked to another user"

  場景: 解除綁定 Google 帳號
    假設 我已登入為 "john@example.com"
    而且 我的帳號綁定了 Google ID "google123"
    而且 我的帳號有設定密碼
    當 我發送 DELETE 請求到 "/users/me/unlink-google"
    那麼 回應狀態碼應該是 200
    而且 資料庫中用戶 "john@example.com" 的 "googleId" 應該是 null
    而且 資料庫中用戶 "john@example.com" 的 "oauthProvider" 應該是 null

  場景: 無法解除唯一的登入方式
    假設 我已登入為 "google-only@gmail.com"
    而且 我的帳號只有 Google 登入（無密碼）
    當 我發送 DELETE 請求到 "/users/me/unlink-google"
    那麼 回應狀態碼應該是 400
    而且 回應應該包含錯誤訊息 "Cannot unlink the only login method"

  場景: Google ID Token 無效
    當 我發送 POST 請求到 "/auth/google/login" 帶著:
      """json
      {
        "idToken": "invalid-token"
      }
      """
    那麼 回應狀態碼應該是 401
    而且 回應應該包含錯誤訊息 "Invalid Google ID token"

  場景: Google 登入的非活躍帳號
    假設 資料庫已存在用戶:
      | email          | googleId  | isActive |
      | locked@gmail.com | google999 | false    |
    當 我使用 Google ID "google999" 登入
    那麼 回應狀態碼應該是 403
    而且 回應應該包含錯誤訊息 "Account is inactive"

  場景: Google 首次登入需要設定顯示名稱
    假設 Google 返回的用戶資訊沒有 name
    當 我首次使用 Google 登入
    那麼 回應應該包含 "needsDisplayName": true
    而且 我應該被導向到設定顯示名稱頁面
    而且 我可以發送 PATCH 請求到 "/users/me/display-name" 設定名稱

  場景: 驗證 Google ID Token 的基本流程
    當 我提供 Google ID Token
    那麼 系統應該向 Google API 驗證 token
    而且 系統應該提取 "sub" (googleId), "email", "name"
    而且 系統應該檢查 email 是否已驗證
    而且 如果 Google 用戶沒有 email，應該拒絕登入
