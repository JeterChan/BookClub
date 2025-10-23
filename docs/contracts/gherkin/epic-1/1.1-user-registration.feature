# language: zh-TW
功能: 用戶註冊
  作為一個新用戶
  我想要註冊一個帳號
  以便我可以使用線上讀書會平台

  背景:
    假設 API 端點是 "http://localhost:3001/api"
    而且 資料庫是空的

  場景: 成功註冊新用戶
    假設 我在註冊頁面
    當 我填寫以下註冊資訊:
      | 欄位         | 值                      |
      | email       | john@example.com        |
      | password    | SecurePass123           |
      | displayName | John Doe                |
    而且 我點擊"註冊"按鈕
    那麼 我應該看到成功訊息 "註冊成功"
    而且 我應該被導向到登入頁面
    而且 資料庫應該包含用戶:
      | email            | displayName | isActive |
      | john@example.com | John Doe    | true     |

  場景: 使用 API 成功註冊
    當 我發送 POST 請求到 "/auth/register" 帶著:
      """json
      {
        "email": "test@example.com",
        "password": "SecurePass123",
        "displayName": "Test User"
      }
      """
    那麼 回應狀態碼應該是 201
    而且 回應應該包含 JSON:
      """json
      {
        "id": "<integer>",
        "email": "test@example.com",
        "displayName": "Test User",
        "isActive": true
      }
      """
    而且 回應欄位應該使用 camelCase 格式
    而且 回應不應該包含 "passwordHash" 欄位

  場景: Email 已存在錯誤
    假設 資料庫已存在用戶:
      | email            | displayName | password_hash |
      | john@example.com | John        | $2b$12$...   |
    當 我發送 POST 請求到 "/auth/register" 帶著:
      """json
      {
        "email": "john@example.com",
        "password": "NewPass123",
        "displayName": "John Doe"
      }
      """
    那麼 回應狀態碼應該是 400
    而且 回應應該包含錯誤訊息 "Email already exists"

  場景大綱: 密碼格式驗證
    當 我發送 POST 請求到 "/auth/register" 帶著:
      """json
      {
        "email": "test@example.com",
        "password": "<password>",
        "displayName": "Test User"
      }
      """
    那麼 回應狀態碼應該是 422
    而且 回應應該包含驗證錯誤關於 "password"

    例子:
      | password    | 原因                |
      | short       | 少於 8 字元         |
      | nouppercas  | 沒有大寫字母        |
      | NOLOWERCASE | 沒有小寫字母        |
      | NoNumber    | 沒有數字            |

  場景大綱: 必填欄位驗證
    當 我發送 POST 請求到 "/auth/register" 帶著不完整的資料:
      | 欄位         | 值                |
      | <缺少欄位>   | <應該被忽略>      |
    那麼 回應狀態碼應該是 422
    而且 回應應該包含驗證錯誤關於 "<缺少欄位>"

    例子:
      | 缺少欄位     |
      | email       |
      | password    |
      | displayName |

  場景: Email 格式驗證
    當 我發送 POST 請求到 "/auth/register" 帶著:
      """json
      {
        "email": "invalid-email",
        "password": "SecurePass123",
        "displayName": "Test User"
      }
      """
    那麼 回應狀態碼應該是 422
    而且 回應應該包含驗證錯誤關於 "email"
    而且 錯誤訊息應該提到 "無效的 email 格式"

  場景: 顯示名稱長度驗證
    當 我發送 POST 請求到 "/auth/register" 帶著:
      """json
      {
        "email": "test@example.com",
        "password": "SecurePass123",
        "displayName": "這是一個超過五十個字元的顯示名稱測試文字內容這是一個超過五十個字元的顯示名稱測試文字內容"
      }
      """
    那麼 回應狀態碼應該是 422
    而且 回應應該包含驗證錯誤關於 "displayName"

  場景: 註冊後用戶資料正確儲存
    當 我成功註冊用戶:
      | email            | password      | displayName |
      | test@example.com | SecurePass123 | Test User   |
    那麼 資料庫應該包含用戶 "test@example.com"
    而且 用戶的密碼應該被 bcrypt 雜湊
    而且 用戶的 "isActive" 應該是 true
    而且 用戶的 "createdAt" 應該是今天
    而且 用戶的 "updatedAt" 應該是今天
    而且 用戶不應該有 "googleId"
    而且 用戶不應該有 "oauthProvider"
