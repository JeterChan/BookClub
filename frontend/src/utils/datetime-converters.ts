// frontend/src/utils/datetime-converters.ts

/**
 * 將本地時間轉換為 UTC+8 時區的 ISO 8601 格式
 * 用戶在 datetime-local 選擇的時間會被視為 UTC+8 時間
 * 
 * @param localDatetime datetime-local input 的值 (YYYY-MM-DDTHH:mm)
 * @returns UTC+8 時區的 ISO 8601 格式字串
 * 
 * @example
 * 用戶選擇: 2025-11-08T14:00 (希望是 UTC+8 下午2點)
 * 返回: 2025-11-08T14:00:00+08:00
 */
export const convertLocalToUTC = (localDatetime: string): string => {
  if (!localDatetime) return '';
  
  // 將用戶選擇的時間視為 UTC+8 時區
  // 格式：2025-11-08T14:00 → 2025-11-08T14:00:00+08:00
  return `${localDatetime}:00+08:00`;
};

/**
 * 將 ISO 8601 格式轉換為本地 datetime-local 格式
 * @param utcDatetime ISO 8601 格式字串（可能包含時區信息）
 * @returns datetime-local input 的值 (YYYY-MM-DDTHH:mm)
 * 
 * @example
 * 輸入: 2025-11-08T14:00:00+08:00 或 2025-11-08T06:00:00Z
 * 輸出: 2025-11-08T14:00 (UTC+8 時間)
 */
export const convertUTCToLocal = (utcDatetime: string): string => {
  if (!utcDatetime) return '';
  
  const date = new Date(utcDatetime);
  
  // 轉換為 UTC+8 時區（加 8 小時）
  const utc8Date = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  
  // 格式化為 YYYY-MM-DDTHH:mm
  const year = utc8Date.getUTCFullYear();
  const month = String(utc8Date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc8Date.getUTCDate()).padStart(2, '0');
  const hours = String(utc8Date.getUTCHours()).padStart(2, '0');
  const minutes = String(utc8Date.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
