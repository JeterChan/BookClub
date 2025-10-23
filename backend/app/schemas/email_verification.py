from sqlmodel import SQLModel

class EmailVerificationRequest(SQLModel):
    """重新發送驗證信請求"""
    email: str

class EmailVerificationResponse(SQLModel):
    """驗證結果回應"""
    message: str
    success: bool

class VerifyEmailRequest(SQLModel):
    """Email 驗證請求 (Query Parameter)"""
    token: str
