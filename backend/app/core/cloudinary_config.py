"""
Cloudinary 圖片上傳服務配置

此模組負責：
1. 初始化 Cloudinary SDK
2. 提供圖片上傳和刪除功能
3. 處理 Cloudinary URL 和 public_id 轉換
"""

import os
import cloudinary
import cloudinary.uploader
from typing import Optional

# 初始化 Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


def upload_image(file_bytes: bytes, folder: str, public_id: Optional[str] = None) -> str:
    """
    上傳圖片到 Cloudinary
    
    Args:
        file_bytes: 圖片的 bytes 資料
        folder: Cloudinary 資料夾名稱 (如 'avatars', 'club_covers')
        public_id: 自定義檔案名稱（選填），用於覆蓋舊圖片
    
    Returns:
        圖片的公開 HTTPS URL
        
    Raises:
        Exception: 當上傳失敗時拋出異常
    """
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=f"bookclub/{folder}",
            public_id=public_id,
            resource_type="image",
            # 自動優化圖片品質和格式
            quality="auto",
            fetch_format="auto"
        )
        return result['secure_url']
    except Exception as e:
        raise Exception(f"圖片上傳至 Cloudinary 失敗: {str(e)}")


def delete_image(public_id: str) -> bool:
    """
    從 Cloudinary 刪除圖片
    
    Args:
        public_id: 完整的 public_id (包含 folder 路徑)
                  例如: "bookclub/avatars/user_123"
    
    Returns:
        是否刪除成功
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"從 Cloudinary 刪除圖片失敗: {str(e)}")
        return False


def extract_public_id_from_url(cloudinary_url: str) -> str:
    """
    從 Cloudinary URL 提取 public_id
    
    Args:
        cloudinary_url: Cloudinary CDN URL
                       例如: https://res.cloudinary.com/.../bookclub/avatars/user_123.jpg
    
    Returns:
        public_id 字串，例如: "bookclub/avatars/user_123"
    """
    if not cloudinary_url:
        return ""
    
    try:
        # 分割 URL，取得 /upload/ 之後的部分
        parts = cloudinary_url.split('/upload/')
        if len(parts) < 2:
            return ""
        
        path_with_version = parts[1]
        
        # 移除版本號 (v1234567890/)
        path_parts = path_with_version.split('/')
        if len(path_parts) > 1:
            # 跳過第一個元素（版本號）
            path = '/'.join(path_parts[1:])
        else:
            path = path_with_version
        
        # 移除副檔名
        if '.' in path:
            path = path.rsplit('.', 1)[0]
        
        return path
    except Exception as e:
        print(f"提取 public_id 失敗: {str(e)}")
        return ""
