#!/bin/bash
# BookClub 測試資料生成腳本

echo "🌱 BookClub 測試資料生成工具"
echo "================================"
echo ""

# 檢查 Docker 是否運行
if ! docker-compose ps | grep -q "web.*Up"; then
    echo "❌ 錯誤：Docker 容器未運行"
    echo "請先執行: docker-compose up -d"
    exit 1
fi

echo "📦 檢查資料庫連線..."
docker-compose exec web python -c "from app.db.session import engine; print('✅ 資料庫連線成功')" || {
    echo "❌ 資料庫連線失敗"
    exit 1
}

echo ""
echo "🚀 開始生成測試資料..."
echo "================================"
docker-compose exec web python seed_book_clubs.py

echo ""
echo "================================"
echo "✨ 完成！"
echo ""
echo "📝 下一步："
echo "   1. 開啟瀏覽器：http://localhost:5173"
echo "   2. 使用測試帳號登入："
echo "      Email: user1@bookclub.com"
echo "      密碼: Test1234"
echo ""
echo "💡 提示："
echo "   - 共有 20 個測試用戶 (user1~user20@bookclub.com)"
echo "   - 所有用戶密碼都是: Test1234"
echo "   - 可以使用不同帳號測試多用戶互動"
echo ""
