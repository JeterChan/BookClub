"""
集中式日誌配置模組
提供統一的日誌記錄功能
"""
import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler

# 日誌目錄
LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# 日誌格式
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# 日誌級別配置
LOG_LEVEL = logging.INFO


def setup_logger(name: str, log_file: str = None, level=LOG_LEVEL) -> logging.Logger:
    """
    設置並返回一個配置好的 logger
    
    Args:
        name: logger 名稱
        log_file: 日誌文件名（可選）
        level: 日誌級別
    
    Returns:
        配置好的 Logger 實例
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # 避免重複添加 handler
    if logger.handlers:
        return logger
    
    # 創建格式化器
    formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    
    # 控制台 Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 文件 Handler（如果指定了文件名）
    if log_file:
        file_path = LOG_DIR / log_file
        file_handler = RotatingFileHandler(
            file_path,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


# 預定義的 logger 實例
app_logger = setup_logger("app", "app.log")
api_logger = setup_logger("api", "api.log")
db_logger = setup_logger("database", "database.log")
auth_logger = setup_logger("auth", "auth.log")
error_logger = setup_logger("error", "error.log", logging.ERROR)


def log_api_request(endpoint: str, method: str, user_id: int = None, club_id: int = None):
    """記錄 API 請求"""
    api_logger.info(
        f"API Request - Method: {method}, Endpoint: {endpoint}, "
        f"User: {user_id}, Club: {club_id}"
    )


def log_api_response(endpoint: str, status_code: int, duration: float = None):
    """記錄 API 響應"""
    api_logger.info(
        f"API Response - Endpoint: {endpoint}, Status: {status_code}, "
        f"Duration: {duration:.3f}s" if duration else f"Status: {status_code}"
    )


def log_database_operation(operation: str, table: str, record_id: int = None, user_id: int = None):
    """記錄資料庫操作"""
    db_logger.info(
        f"DB Operation - {operation} on {table}, "
        f"Record ID: {record_id}, User: {user_id}"
    )


def log_auth_event(event: str, user_id: int = None, email: str = None, success: bool = True):
    """記錄認證事件"""
    level = logging.INFO if success else logging.WARNING
    auth_logger.log(
        level,
        f"Auth Event - {event}, User ID: {user_id}, Email: {email}, "
        f"Success: {success}"
    )


def log_error(error: Exception, context: str = None, user_id: int = None):
    """記錄錯誤"""
    error_logger.error(
        f"Error - {context if context else 'Unknown Context'}, "
        f"User: {user_id}, Error: {str(error)}",
        exc_info=True
    )


def log_business_event(event: str, details: dict = None):
    """記錄業務事件"""
    app_logger.info(f"Business Event - {event}, Details: {details}")
