# language: zh-TW
功能: 個人儀表板
  作為一個已登入的用戶
  我想要查看我的個人儀表板
  以便我可以快速瞭解我的活動和統計資料

  背景:
    假設 API 端點是 "http://localhost:3001/api"
    而且 我已登入為 "john@example.com"

  場景: 查看個人儀表板 (Epic 1 階段)
    當 我發送 GET 請求到 "/users/me/dashboard"
    那麼 回應狀態碼應該是 200
    而且 回應應該包含 JSON (camelCase 格式):
      """json
      {
        "user": {
          "id": "<uuid>",
          "displayName": "John Doe",
          "avatarUrl": "/avatar.jpg"
        },
        "stats": {
          "joinedBookClubs": 0,
          "createdThreads": 0,
          "totalPosts": 0
        },
        "recentActivity": []
      }
      """
    而且 所有欄位名稱應該是 camelCase 格式

  場景: UI 顯示儀表板
    假設 我在儀表板頁面 "/dashboard"
    那麼 我應該看到我的顯示名稱
    而且 我應該看到我的頭像
    而且 我應該看到統計區塊顯示:
      | label     | value |
      | 加入的讀書會 | 0     |
      | 發起的討論  | 0     |
      | 總發文數   | 0     |
    而且 我應該看到訊息 "目前沒有最近的活動"

  場景: 驗證 camelCase 格式轉換
    當 我呼叫儀表板 API
    那麼 資料庫欄位 "display_name" 應該轉換為 "displayName"
    而且 資料庫欄位 "avatar_url" 應該轉換為 "avatarUrl"
    而且 資料庫欄位 "joined_book_clubs" 應該轉換為 "joinedBookClubs"
    而且 資料庫欄位 "created_threads" 應該轉換為 "createdThreads"
    而且 資料庫欄位 "total_posts" 應該轉換為 "totalPosts"
    而且 資料庫欄位 "recent_activity" 應該轉換為 "recentActivity"

  場景: 未驗證用戶無法訪問儀表板
    假設 我沒有提供 Authorization header
    當 我發送 GET 請求到 "/users/me/dashboard"
    那麼 回應狀態碼應該是 401
    而且 回應應該包含錯誤訊息 "Unauthorized"

  場景: 無效 Token 無法訪問儀表板
    假設 我提供無效的 JWT token
    當 我發送 GET 請求到 "/users/me/dashboard"
    那麼 回應狀態碼應該是 401
    而且 回應應該包含錯誤訊息 "Invalid token"

  場景: 過期 Token 無法訪問儀表板
    假設 我的 JWT token 已過期
    當 我發送 GET 請求到 "/users/me/dashboard"
    那麼 回應狀態碼應該是 401
    而且 回應應該包含錯誤訊息 "Token expired"
    而且 前端應該重定向到登入頁面

  場景: 非活躍用戶無法訪問儀表板
    假設 我的帳號 "isActive" 為 false
    當 我嘗試訪問儀表板
    那麼 回應狀態碼應該是 403
    而且 回應應該包含錯誤訊息 "Account is inactive"

  場景: 儀表板資料回應時間
    當 我發送 GET 請求到 "/users/me/dashboard"
    那麼 回應時間應該少於 500ms
    而且 應該使用資料庫查詢優化（JOIN, SELECT 指定欄位）

  場景: 儀表板空狀態友善提示
    假設 我是新註冊用戶
    而且 我沒有任何活動記錄
    當 我在 UI 查看儀表板
    那麼 我應該看到友善的空狀態訊息
    而且 我應該看到建議行動:
      | action       | description      |
      | 加入讀書會    | 探索並加入你感興趣的讀書會 |
      | 完善個人資料  | 上傳頭像和新增興趣標籤    |

  場景: 從儀表板導航到其他頁面
    假設 我在儀表板頁面
    那麼 我應該可以點擊導航到:
      | link       | destination |
      | 個人資料    | /profile    |
      | 探索讀書會  | /book-clubs |
      | 通知中心    | /notifications |

  場景: 驗證 ISO 8601 日期時間格式
    當 儀表板回應包含時間戳記
    那麼 所有日期時間應該是 ISO 8601 格式（例如 "2024-01-15T10:30:00Z"）
    而且 時區應該是 UTC

  場景: 儀表板資料結構完整性
    當 我呼叫儀表板 API
    那麼 回應應該包含 "user" 物件
    而且 "user" 應該包含 "id", "displayName", "avatarUrl"
    而且 回應應該包含 "stats" 物件
    而且 "stats" 應該包含所有統計欄位（即使為 0）
    而且 回應應該包含 "recentActivity" 陣列（即使為空）
