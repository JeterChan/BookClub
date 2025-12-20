# 測試指南 (Testing Guide)

本專案的整合測試完整指南。

---

## 🚀 快速開始

### 執行整合測試

```bash
# 方式 1: 使用自動化腳本 (推薦)
./scripts/run-integration-tests.sh

# 方式 2: 手動執行
docker-compose -f docker-compose.integration-test.yml up -d
sleep 20  # 等待服務啟動
docker-compose -f docker-compose.integration-test.yml exec test-backend pytest tests/integration/ -v --cov
docker-compose -f docker-compose.integration-test.yml down -v
```

### 執行特定測試

```bash
# 啟動測試環境
docker-compose -f docker-compose.integration-test.yml up -d

# 執行特定測試文件
docker-compose -f docker-compose.integration-test.yml exec test-backend pytest tests/integration/test_create_book_club.py -v

# 執行特定測試函數
docker-compose -f docker-compose.integration-test.yml exec test-backend pytest tests/integration/test_create_book_club.py::test_create_public_book_club_success -v

# 清理環境
docker-compose -f docker-compose.integration-test.yml down -v
```

---

## 📁 測試結構

```
backend/tests/
├── conftest.py                    # 測試配置與 fixtures
├── fixtures/
│   ├── __init__.py
│   └── data_factory.py            # 測試資料生成工廠
├── unit/                          # 單元測試
│   ├── test_dashboard_service.py
│   └── ...
└── integration/                   # 整合測試
    ├── test_user_journey.py       # 用戶流程測試 (新)
    ├── test_club_operations.py    # 讀書會操作測試 (新)
    ├── test_discussion_flow.py    # 討論流程測試 (新)
    ├── test_create_book_club.py   # 建立讀書會 API
    ├── test_dashboard_api.py      # 儀表板 API
    ├── test_discussions_api.py    # 討論區 API
    ├── test_events_api.py         # 活動 API
    ├── test_profile_api.py        # 個人資料 API
    └── ...
```

---

## 🧪 測試類型

### 1. 單元測試 (Unit Tests)
測試單一函數或類別的功能

```bash
pytest backend/tests/unit/ -v
```

### 2. 整合測試 (Integration Tests)
測試多個元件協同工作

```bash
pytest backend/tests/integration/ -v
```

### 3. 完整測試套件
執行所有測試

```bash
pytest backend/tests/ -v --cov=app --cov-report=html
```

---

## 📊 測試覆蓋率

### 產生覆蓋率報告

```bash
# 終端機報告
docker-compose -f docker-compose.integration-test.yml exec test-backend \
  pytest tests/integration/ --cov=app --cov-report=term-missing

# HTML 報告
docker-compose -f docker-compose.integration-test.yml exec test-backend \
  pytest tests/integration/ --cov=app --cov-report=html

# 查看 HTML 報告
open backend/htmlcov/index.html
```

---

## 🛠️ 測試工具

### Pytest 常用選項

```bash
# 詳細輸出
pytest -v

# 顯示print輸出
pytest -s

# 只執行失敗的測試
pytest --lf

# 執行到第一個失敗就停止
pytest -x

# 平行執行 (需要 pytest-xdist)
pytest -n auto

# 產生覆蓋率報告
pytest --cov=app --cov-report=html

# 不顯示traceback
pytest --tb=no
```

### 測試標記 (Markers)

```bash
# 執行特定標記的測試
pytest -m "slow"
pytest -m "not slow"
```

---

## 🔧 測試環境配置

### 環境變數
測試環境使用獨立的環境變數，定義在 `docker-compose.integration-test.yml`:

```yaml
environment:
  DATABASE_URL: postgresql://test_user:test_password@test-db:5432/bookclub_test
  SECRET_KEY: integration-test-secret-key
  SENDGRID_API_KEY: mock_sendgrid_key
  CLOUDINARY_CLOUD_NAME: mock_cloudinary
```

### 資料庫隔離
- 測試資料庫使用 tmpfs (記憶體檔案系統)
- 測試執行後自動清空
- 不影響開發環境資料庫

---

## 📝 撰寫測試

### 使用 Data Factory

```python
from tests.fixtures.data_factory import (
    create_test_user_data,
    create_test_book_club_data
)

def test_example(client: TestClient, session: Session):
    # 建立測試用戶資料
    user_data = create_test_user_data(
        email="test@example.com",
        display_name="Test User"
    )
    
    # 建立測試讀書會資料
    club_data = create_test_book_club_data(
        name="Test Club",
        visibility="public"
    )
```

### 使用 Fixtures

```python
def test_with_authenticated_user(
    authenticated_client: TestClient,
    test_user_for_auth: User,
    auth_headers: dict
):
    response = authenticated_client.get(
        "/api/v1/users/me",
        headers=auth_headers
    )
    assert response.status_code == 200
```

---

## 🐛 除錯測試

### 查看詳細日誌

```bash
# 查看後端日誌
docker-compose -f docker-compose.integration-test.yml logs test-backend -f

# 查看資料庫日誌
docker-compose -f docker-compose.integration-test.yml logs test-db -f
```

### 進入容器除錯

```bash
# 進入後端容器
docker-compose -f docker-compose.integration-test.yml exec test-backend bash

# 在容器內執行 Python REPL
docker-compose -f docker-compose.integration-test.yml exec test-backend python

# 連接測試資料庫
docker-compose -f docker-compose.integration-test.yml exec test-db psql -U test_user -d bookclub_test
```

---

## ✅ 測試最佳實踐

### 1. 測試命名
```python
def test_{功能}_{情境}_{預期結果}():
    # 範例
    def test_create_club_unauthenticated_returns_403():
        pass
```

### 2. AAA 模式
```python
def test_example():
    # Arrange: 準備測試資料
    user_data = create_test_user_data()
    
    # Act: 執行操作
    response = client.post("/api/v1/auth/register", json=user_data)
    
    # Assert: 驗證結果
    assert response.status_code == 201
```

### 3. 獨立性
- 每個測試應該獨立執行
- 不依賴其他測試的結果
- 使用 fixtures 管理測試狀態

### 4. 清晰的斷言
```python
# 好
assert response.status_code == 201
assert "email" in response.json()

# 不好
assert response
```

---

## 📈 測試報告

詳細的測試結果請參考：
- [INTEGRATION_TEST_REPORT.md](./INTEGRATION_TEST_REPORT.md)

---

## 🔗 相關資源

- [Pytest 官方文檔](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLModel Testing](https://sqlmodel.tiangolo.com/tutorial/fastapi/tests/)
- [Faker 文檔](https://faker.readthedocs.io/)

---

**更新日期**: 2025-12-20  
**維護者**: Development Team
