"""
日誌記錄中間件
自動記錄所有 API 請求和響應
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.logging_config import log_api_request, log_api_response, log_error


class LoggingMiddleware(BaseHTTPMiddleware):
    """記錄所有 HTTP 請求和響應的中間件"""
    
    async def dispatch(self, request: Request, call_next):
        # 記錄請求開始時間
        start_time = time.time()
        
        # 提取請求資訊
        method = request.method
        endpoint = request.url.path
        
        # 嘗試獲取用戶 ID（如果有認證）
        user_id = None
        if hasattr(request.state, "user"):
            user_id = getattr(request.state.user, "id", None)
        
        # 記錄請求
        log_api_request(endpoint, method, user_id=user_id)
        
        try:
            # 處理請求
            response: Response = await call_next(request)
            
            # 計算處理時間
            duration = time.time() - start_time
            
            # 記錄響應
            log_api_response(endpoint, response.status_code, duration)
            
            return response
            
        except Exception as e:
            # 記錄錯誤
            duration = time.time() - start_time
            log_error(e, context=f"{method} {endpoint}", user_id=user_id)
            log_api_response(endpoint, 500, duration)
            raise
