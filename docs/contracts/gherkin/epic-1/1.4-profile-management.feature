# language: zh-TW
功能: 個人檔案管理
  作為一個已登入的用戶
  我想要管理我的個人檔案
  以便我可以展示我的個性和興趣

  背景:
    假設 API 端點是 "http://localhost:3001/api"
    而且 我已登入為 "john@example.com"
    而且 我的資料是:
      | email           | displayName | bio          | avatarUrl | createdAt  |
      | john@example.com | John Doe    | Book lover   | /avatar.jpg | 2024-01-01 |

  場景: 查看個人檔案
    當 我發送 GET 請求到 "/users/me"
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 JSON (camelCase 格式):
      """json
      {
        "id": "<uuid>",
        "email": "john@example.com",
        "displayName": "John Doe",
        "bio": "Book lover",
        "avatarUrl": "/avatar.jpg",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "<ISO8601>"
      }
      """
    而且 回應不應該包含 "passwordHash"
    而且 回應不應該包含 "failedLoginAttempts"

  場景: 更新顯示名稱
    當 我發送 PATCH 請求到 "/users/me" 帶著:
      """json
      {
        "displayName": "Johnny Doe"
      }
      """
    那麼 回應狀態碼應該是 200
    而且 資料庫中用戶 "john@example.com" 的 "displayName" 應該是 "Johnny Doe"
    而且 用戶的 "updatedAt" 應該更新為今天

  場景: 更新個人簡介
    當 我發送 PATCH 請求到 "/users/me" 帶著:
      """json
      {
        "bio": "Passionate reader and book club enthusiast"
      }
      """
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 "bio": "Passionate reader and book club enthusiast"

  場景大綱: 顯示名稱驗證失敗
    當 我發送 PATCH 請求到 "/users/me" 帶著:
      """json
      {
        "displayName": "<displayName>"
      }
      """
    那麼 回應狀態碼應該是 <statusCode>
    而且 回應應該包含錯誤訊息 "<errorMessage>"

    例子:
      | displayName | statusCode | errorMessage                      |
      |             | 422        | Display name cannot be empty      |
      | A           | 422        | Display name must be at least 2   |
      | Very long name that exceeds the fifty character limit here | 422 | Display name cannot exceed 50 |

  場景: 上傳頭像
    當 我發送 POST 請求到 "/users/me/avatar" 帶著 multipart/form-data:
      | field | value              | type |
      | file  | profile-pic.jpg    | file |
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 "avatarUrl"
    而且 "avatarUrl" 應該以 "/uploads/avatars/" 開頭
    而且 圖片應該儲存在 "backend/uploads/avatars/" 目錄
    而且 資料庫中用戶的 "avatarUrl" 應該更新

  場景: 上傳頭像格式驗證
    當 我上傳一個 .txt 文件作為頭像
    那麼 回應狀態碼應該是 400
    而且 回應應該包含錯誤訊息 "Only image files are allowed"

  場景: 上傳頭像大小限制
    當 我上傳一個 6MB 的圖片
    那麼 回應狀態碼應該是 413
    而且 回應應該包含錯誤訊息 "File size exceeds 5MB limit"

  場景: 刪除頭像
    當 我發送 DELETE 請求到 "/users/me/avatar"
    那麼 回應狀態碼應該是 200
    而且 資料庫中用戶的 "avatarUrl" 應該是 null
    而且 舊的頭像文件應該從伺服器刪除

  場景: 新增興趣標籤
    假設 資料庫中存在興趣標籤 "科幻小說"
    當 我發送 POST 請求到 "/users/me/interests" 帶著:
      """json
      {
        "tagName": "科幻小說"
      }
      """
    那麼 回應狀態碼應該是 201
    而且 資料庫的 "user_interest_tags" 表應該包含:
      | userId  | tagId       |
      | <my-id> | <sci-fi-id> |

  場景: 獲取我的興趣標籤列表
    假設 我已新增興趣標籤 "科幻小說" 和 "推理小說"
    當 我發送 GET 請求到 "/users/me/interests"
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 JSON 陣列:
      """json
      [
        { "id": "<uuid>", "name": "科幻小說" },
        { "id": "<uuid>", "name": "推理小說" }
      ]
      """

  場景: 刪除興趣標籤
    假設 我已新增興趣標籤 "科幻小說"
    當 我發送 DELETE 請求到 "/users/me/interests/<tag-id>"
    那麼 回應狀態碼應該是 204
    而且 資料庫的 "user_interest_tags" 表應該不包含該關聯

  場景: 新增不存在的標籤自動創建
    假設 資料庫中不存在標籤 "奇幻小說"
    當 我發送 POST 請求到 "/users/me/interests" 帶著:
      """json
      {
        "tagName": "奇幻小說"
      }
      """
    那麼 回應狀態碼應該是 201
    而且 資料庫的 "interest_tags" 表應該包含 "奇幻小說"
    而且 該標籤應該自動關聯到我的帳號

  場景: 無法重複新增相同標籤
    假設 我已新增興趣標籤 "科幻小說"
    當 我再次新增 "科幻小說"
    那麼 回應狀態碼應該是 400
    而且 回應應該包含錯誤訊息 "Interest tag already added"

  場景: 標籤數量限制
    假設 我已新增 10 個興趣標籤
    當 我嘗試新增第 11 個標籤
    那麼 回應狀態碼應該是 400
    而且 回應應該包含錯誤訊息 "Maximum 10 interest tags allowed"
