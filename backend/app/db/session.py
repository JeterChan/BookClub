import os
from sqlmodel import Session, create_engine
from typing import Generator

# 從環境變數獲取資料庫 URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@db:5432/bookclub_dev")

# 建立資料庫引擎
engine = create_engine(DATABASE_URL, echo=True)

def get_session() -> Generator[Session, None, None]:
    """
    提供資料庫 session 的依賴注入函式
    
    Yields:
        Session: SQLModel 資料庫 session
    """
    with Session(engine) as session:
        yield session
