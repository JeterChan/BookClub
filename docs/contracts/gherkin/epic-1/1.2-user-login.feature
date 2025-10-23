# language: zh-TW
功能: 用戶登入
  作為一個已註冊的用戶
  我想要登入我的帳號
  以便我可以訪問平台功能

  背景:
    假設 API 端點是 "http://localhost:3001/api"
    而且 資料庫已存在用戶:
      | email            | password_hash                           | displayName | isActive | failedLoginAttempts | lockedUntil |
      | john@example.com | $2b$12$SecurePass123HashedValue          | John Doe    | true     | 0                   | null        |
      | locked@test.com  | $2b$12$SecurePass123HashedValue          | Locked User | true     | 5                   | 2025-10-22T16:00:00Z |
      | inactive@test.com| $2b$12$SecurePass123HashedValue          | Inactive    | false    | 0                   | null        |

  場景: 成功登入
    假設 我在登入頁面
    當 我填寫以下登入資訊:
      | 欄位     | 值                 |
      | email    | john@example.com   |
      | password | SecurePass123      |
    而且 我點擊"登入"按鈕
    那麼 我應該看到成功訊息 "登入成功"
    而且 我應該被導向到儀表板
    而且 我應該在 localStorage 中看到 "accessToken"

  場景: 使用 API 成功登入
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "john@example.com",
        "password": "SecurePass123",
        "rememberMe": false
      }
      """
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 JSON:
      """json
      {
        "accessToken": "<string>",
        "tokenType": "bearer"
      }
      """
    而且 "accessToken" 應該是有效的 JWT token
    而且 JWT payload 應該包含 "sub" 欄位等於 "john@example.com"

  場景: 使用 Remember Me 登入
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "john@example.com",
        "password": "SecurePass123",
        "rememberMe": true
      }
      """
    那麼 回應狀態碼應該是 200
    而且 "accessToken" 的過期時間應該是 7 天
    而且 資料庫中用戶 "john@example.com" 的 "failedLoginAttempts" 應該是 0

  場景: 錯誤的密碼
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "john@example.com",
        "password": "WrongPassword123",
        "rememberMe": false
      }
      """
    那麼 回應狀態碼應該是 401
    而且 回應應該包含錯誤訊息 "Invalid credentials"
    而且 資料庫中用戶 "john@example.com" 的 "failedLoginAttempts" 應該增加 1

  場景: 不存在的 Email
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "notexist@example.com",
        "password": "SecurePass123",
        "rememberMe": false
      }
      """
    那麼 回應狀態碼應該是 401
    而且 回應應該包含錯誤訊息 "Invalid credentials"

  場景: 帳號鎖定機制 - 第 5 次失敗
    假設 用戶 "john@example.com" 已經失敗登入 4 次
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "john@example.com",
        "password": "WrongPassword",
        "rememberMe": false
      }
      """
    那麼 回應狀態碼應該是 401
    而且 資料庫中用戶 "john@example.com" 的 "failedLoginAttempts" 應該是 5
    而且 資料庫中用戶 "john@example.com" 的 "lockedUntil" 應該設定為 15 分鐘後

  場景: 嘗試登入已鎖定的帳號
    假設 當前時間是 "2025-10-22T15:00:00Z"
    而且 用戶 "locked@test.com" 被鎖定到 "2025-10-22T16:00:00Z"
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "locked@test.com",
        "password": "SecurePass123",
        "rememberMe": false
      }
      """
    那麼 回應狀態碼應該是 403
    而且 回應應該包含錯誤訊息包含 "Account is locked"
    而且 回應應該提示解鎖時間

  場景: 鎖定時間過後可以登入
    假設 當前時間是 "2025-10-22T16:01:00Z"
    而且 用戶 "locked@test.com" 被鎖定到 "2025-10-22T16:00:00Z"
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "locked@test.com",
        "password": "SecurePass123",
        "rememberMe": false
      }
      """
    那麼 回應狀態碼應該是 200
    而且 資料庫中用戶 "locked@test.com" 的 "failedLoginAttempts" 應該重置為 0
    而且 資料庫中用戶 "locked@test.com" 的 "lockedUntil" 應該是 null

  場景: 非活躍帳號無法登入
    當 我發送 POST 請求到 "/auth/login" 帶著:
      """json
      {
        "email": "inactive@test.com",
        "password": "SecurePass123",
        "rememberMe": false
      }
      """
    那麼 回應狀態碼應該是 403
    而且 回應應該包含錯誤訊息 "Account is inactive"

  場景: 成功登入後重置失敗計數
    假設 用戶 "john@example.com" 已經失敗登入 3 次
    當 我成功登入為 "john@example.com"
    那麼 資料庫中用戶 "john@example.com" 的 "failedLoginAttempts" 應該是 0

  場景大綱: 必填欄位驗證
    當 我發送 POST 請求到 "/auth/login" 帶著不完整的資料:
      | 缺少欄位  |
      | <欄位>    |
    那麼 回應狀態碼應該是 422
    而且 回應應該包含驗證錯誤關於 "<欄位>"

    例子:
      | 欄位     |
      | email    |
      | password |

  場景: JWT Token 包含正確的聲明
    當 我成功登入為 "john@example.com"
    那麼 JWT token 應該包含:
      | 聲明 | 值                 |
      | sub  | john@example.com   |
      | exp  | <未來時間戳>       |
    而且 JWT token 使用 HS256 演算法簽名
    而且 JWT token 可以被驗證

  場景: Token 過期時間正確設定
    當 我登入時 rememberMe 為 false
    那麼 Token 過期時間應該是 30 分鐘
    當 我登入時 rememberMe 為 true
    那麼 Token 過期時間應該是 7 天
