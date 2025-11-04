/**
 * 將相對路徑的圖片 URL 轉換為完整的 URL
 * @param url - 圖片 URL（可能是相對路徑或完整 URL）
 * @returns 完整的圖片 URL
 */
export const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // 如果已經是完整的 URL（http:// 或 https://），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相對路徑，加上後端伺服器地址
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${backendUrl}${url}`;
};
