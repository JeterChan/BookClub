# 3. 資料庫遷移 (Alembic)

我們將使用 Alembic 來管理資料庫結構的變更。

1.  **初始化 Alembic** (只需執行一次):
    ```bash
    # 在 backend/ 目錄下執行
    alembic init alembic
    ```
    這會建立 `alembic` 資料夾和 `alembic.ini` 設定檔。需要修改設定檔以指向我們的資料庫。

2.  **建立遷移腳本**:
    ```bash
    alembic revision --autogenerate -m "Create user table"
    ```
    Alembic 會比較 SQLModel 模型和資料庫的差異，自動產生遷移腳本。

3.  **應用遷移**:
    ```bash
    alembic upgrade head
    ```
    這會將最新的遷移應用到資料庫。

---
