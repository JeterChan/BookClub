# CORS 配置說明

## 📋 當前配置

後端已添加 CORS (Cross-Origin Resource Sharing) 中間件，允許前端應用從不同的 origin 訪問 API。

### 配置位置
`backend/app/main.py`

### 允許的 Origins
- http://localhost:5173 (Vite 預設 port)
- http://localhost:5174 (備用 port)
- http://localhost:5175 (備用 port)
- http://localhost:3000 (常見前端 port)
- 對應的 127.0.0.1 地址

### CORS 設定參數
- allow_origins: 允許的前端 origins 列表
- allow_credentials: True (允許發送 cookies 和認證 headers)
- allow_methods: ["*"] (允許所有 HTTP 方法)
- allow_headers: ["*"] (允許所有 headers)

## 🔒 生產環境建議

生產環境應該：
1. 使用環境變數配置 allowed origins
2. 明確指定允許的 HTTP methods
3. 明確指定允許的 headers
4. 使用 HTTPS

## 🚀 重啟後端

添加 CORS 後需要重啟後端服務以生效。
