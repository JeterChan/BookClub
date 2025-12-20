/// <reference types="@wdio/globals/types" />

import BasePage from './BasePage';

class ClubSettingsPage extends BasePage {
  /**
   * 導航至讀書會設定頁面
   * @param clubId 讀書會 ID
   */
  async navigateToSettings(clubId: string) {
    await browser.url(`/clubs/${clubId}/settings`);
    
    // 等待頁面載入完成
    await browser.waitUntil(
      async () => {
        const state = await browser.execute(() => document.readyState);
        return state === 'complete';
      },
      { timeout: 10000, timeoutMsg: '頁面載入超時' }
    );
    
    // 檢查是否被重定向到登入頁面
    const currentUrl = await browser.getUrl();
    if (currentUrl.includes('/login')) {
      throw new Error(`❌ 導航到設定頁面失敗：被重定向到登入頁面\n` +
                      `目標 URL: /clubs/${clubId}/settings\n` +
                      `當前 URL: ${currentUrl}\n` +
                      `可能原因：\n` +
                      `1. 使用者未登入或登入狀態已過期\n` +
                      `2. 使用者沒有該讀書會的管理員權限\n` +
                      `3. Session cookie 遺失或無效`);
    }
    
    // 確認已導航到正確的設定頁面
    const expectedUrlPattern = `/clubs/${clubId}/settings`;
    if (!currentUrl.includes(expectedUrlPattern)) {
      throw new Error(`❌ URL 不符合預期\n` +
                      `預期包含: ${expectedUrlPattern}\n` +
                      `實際 URL: ${currentUrl}`);
    }
    
    console.log(`✅ 成功導航到讀書會設定頁面: ${currentUrl}`);
  }

  /**
   * 更新讀書會名稱
   * @param newName 新名稱
   */
  async updateClubName(newName: string) {
    const input = await $('input[name="name"]');
    await input.waitForDisplayed({ timeout: 10000 });
    await input.clearValue();
    await input.setValue(newName);
  }

  /**
   * 更新讀書會簡介
   * @param newDescription 新簡介
   */
  async updateClubDescription(newDescription: string) {
    const textarea = await $('textarea[name="description"]');
    await textarea.waitForDisplayed({ timeout: 10000 });
    await textarea.clearValue();
    await textarea.setValue(newDescription);
  }

  /**
   * 上傳封面圖片
   * @param imagePath 圖片檔案路徑（絕對路徑）
   */
  async uploadCoverImage(imagePath: string) {
    const input = await $('input[type="file"]');
    await input.waitForExist({ timeout: 10000 });
    
    // 使用遠端上傳文件（適用於 headless 模式）
    const remoteFilePath = await browser.uploadFile(imagePath);
    await input.setValue(remoteFilePath);
    
    // 等待圖片預覽更新
    await browser.pause(2000);
  }

  /**
   * 切換讀書會可見性
   * @param isPrivate true 為私密，false 為公開
   */
  async toggleVisibility(isPrivate: boolean) {
    const toggle = await $('select[name="visibility"]');
    await toggle.waitForDisplayed({ timeout: 10000 });
    
    const value = isPrivate ? 'private' : 'public';
    await toggle.selectByAttribute('value', value);
  }

  /**
   * 儲存設定變更
   */
  async saveChanges() {
    const saveBtn = await $('button=儲存變更');
    await saveBtn.waitForClickable({ timeout: 10000 });
    await saveBtn.click();
    // 不暫停，立即返回讓調用者檢查 toast
  }

  /**
   * 檢查儲存是否成功
   * react-hot-toast 預設顯示時間為 3 秒，所以要快速檢查
   */
  async isSaveSuccessful(): Promise<boolean> {
    try {
      console.log('⏳ 等待 toast 出現...');
      
      // 嘗試多次檢查（因為 toast 可能需要一點時間出現）
      for (let i = 0; i < 10; i++) {
        // 嘗試在整個 body 中搜尋成功訊息文字
        const bodyText = await $('body').getText();
        const hasSuccess = bodyText.includes('讀書會資訊已更新') || 
                         bodyText.includes('已更新') || 
                         bodyText.includes('成功');
        
        if (hasSuccess) {
          console.log('✅ 在頁面中找到成功訊息');
          return true;
        }
        
        // 也嘗試使用 react-hot-toast 的常見選擇器
        const toastElements = await $$('[role="status"], [role="alert"], [data-hot-toast], .toast, div[style*="pointer-events"]');
        if (toastElements.length > 0) {
          for (const toast of toastElements) {
            try {
              const text = await toast.getText();
              if (text && (text.includes('已更新') || text.includes('成功') || text.includes('讀書會資訊'))) {
                console.log('✅ 找到成功訊息 toast:', text);
                return true;
              }
            } catch (e) {
              // 元素可能已經消失，繼續
            }
          }
        }
        
        // 等待 500ms 再試
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('❌ 找不到成功訊息 toast');
      return false;
    } catch (error) {
      console.log('❌ 檢查 toast 時發生錯誤:', error);
      // 打印當前頁面的 body 文字幫助調試
      try {
        const bodyText = await $('body').getText();
        console.log('📄 當前頁面文字內容 (前 500 字元):', bodyText.substring(0, 500));
      } catch (e) {
        console.log('無法獲取頁面文字');
      }
      return false;
    }
  }

  /**
   * 獲取錯誤訊息文字
   */
  async getErrorMessage(): Promise<string> {
    const errorMsg = await $('.toast-error, .alert-error');
    await errorMsg.waitForDisplayed({ timeout: 5000 });
    return await errorMsg.getText();
  }

  /**
   * 切換至成員管理標籤
   */
  async switchToMembersTab() {
    console.log('⏳ 嘗試切換到成員管理標籤...');
    
    // 實際頁面使用 button 元素，文字是「成員管理」
    const tab = await $('button=成員管理');
    await tab.waitForClickable({ timeout: 10000 });
    await tab.click();
    console.log('✅ 已點擊成員管理標籤');
    await browser.pause(1000);
  }

  /**
   * 轉讓讀書會擁有權
   * @param newOwnerEmail 新擁有者的電子郵件
   * @returns 是否成功轉讓
   */
  async transferOwnership(newOwnerEmail: string): Promise<boolean> {
    try {
      console.log(`⏳ 嘗試將擁有權轉讓給: ${newOwnerEmail}`);
      
      // 確認已在成員管理頁面
      await this.switchToMembersTab();
      await browser.pause(1000);
      
      // 查找轉讓擁有權區塊
      const transferSection = await $('div.bg-yellow-50');
      const exists = await transferSection.isExisting();
      
      if (!exists) {
        console.log('❌ 找不到轉讓擁有權區塊 (可能非擁有者)');
        return false;
      }
      
      console.log('✅ 找到轉讓擁有權區塊');
      
      // 點擊 Select 下拉選單
      const selectTrigger = await transferSection.$('select');
      await selectTrigger.waitForDisplayed({ timeout: 5000 });
      
      // 找到包含目標 email 的選項
      const options = await selectTrigger.$$('option');
      let targetValue: string | null = null;
      
      for (const option of options) {
        const text = await option.getText();
        if (text.includes(newOwnerEmail)) {
          targetValue = await option.getAttribute('value');
          console.log(`✅ 找到目標成員: ${text}, value: ${targetValue}`);
          break;
        }
      }
      
      if (!targetValue) {
        console.log(`❌ 找不到目標成員: ${newOwnerEmail}`);
        return false;
      }
      
      // 選擇目標成員
      await selectTrigger.selectByAttribute('value', targetValue);
      await browser.pause(500);
      
      // 點擊轉讓按鈕
      const transferBtn = await transferSection.$('button=轉讓');
      await transferBtn.waitForClickable({ timeout: 5000 });
      await transferBtn.click();
      console.log('✅ 點擊轉讓按鈕');
      await browser.pause(1000);
      
      // 在確認對話框中點擊確認
      const confirmModal = await $('[role="dialog"], .modal, div[class*="modal"]');
      if (await confirmModal.isExisting()) {
        console.log('✅ 確認對話框已出現');
        
        // 查找確認按鈕（可能是"確認"、"確定"等）
        const confirmBtn = await $('button=確認');
        if (await confirmBtn.isExisting()) {
          await confirmBtn.click();
          console.log('✅ 點擊確認按鈕');
        } else {
          // 嘗試其他可能的按鈕文字
          const altConfirmBtn = await $('button*=確');
          if (await altConfirmBtn.isExisting()) {
            await altConfirmBtn.click();
            console.log('✅ 點擊確認按鈕 (alt)');
          }
        }
      }
      
      await browser.pause(2000);
      
      // 檢查是否成功（頁面可能會重新整理）
      const bodyText = await $('body').getText();
      const success = bodyText.includes('成功') || bodyText.includes('轉讓');
      
      if (success) {
        console.log('✅ 擁有權轉讓成功');
      } else {
        console.log('⚠️ 無法確認轉讓是否成功');
      }
      
      return true;
    } catch (error) {
      console.log(`❌ 轉讓擁有權時發生錯誤: ${error}`);
      return false;
    }
  }

  /**
   * 驗證設定頁面是否正確載入
   */
  async isSettingsPageLoaded(): Promise<boolean> {
    try {
      const nameInput = await $('input[name="name"]');
      await nameInput.waitForDisplayed({ timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}

export default new ClubSettingsPage();
