import BasePage from './BasePage';

/**
 * ClubCreatePage - 建立讀書會頁面物件
 * 對應頁面: ClubCreate.tsx
 */
class ClubCreatePage extends BasePage {
    // 選擇器
    private get pageTitle() { return $('h1=建立讀書會'); }
    private get nameInput() { return $('input#name'); }
    private get descriptionTextarea() { return $('textarea#description'); }
    private get publicVisibilityButton() { return $('button*=公開讀書會'); }
    private get privateVisibilityButton() { return $('button*=私密讀書會'); }
    private get tagButtons() { return $$('button[type="button"]*=標籤').then(() => $$('button.px-4.py-2.rounded-full')); }
    private get submitButton() { return $('button[type="submit"]*=建立讀書會'); }
    private get cancelButton() { return $('button[type="button"]*=取消'); }

    /**
     * 開啟建立讀書會頁面（現已不直接使用）
     * 透過 ClubsPage.clickCreateClub() 進入
     */
    async open() {
        await super.open('/clubs/create');
        // 移除 waitForDisplayed，因為直接導航可能導致權限問題
        // 應該透過 ClubsPage.clickCreateClub() 進入此頁面
    }

    /**
     * 等待標籤載入完成
     */
    async waitForTagsLoaded() {
        // 等待至少一個標籤按鈕出現
        const firstTag = $('button.px-4.py-2.rounded-full');
        await firstTag.waitForDisplayed({ timeout: 10000 });
    }

    /**
     * 建立讀書會
     * @param clubData - 讀書會資料
     */
    async createClub(clubData: {
        name: string;
        description: string;
        isPublic?: boolean;
    }) {
        // 先等待一個必然成功的操作來刷新 console 緩衝
        await $('body').waitForExist({ timeout: 1000 });
        console.log('⏳ [開始] createClub 方法執行');
        
        try {
            const currentUrl = await this.getCurrentUrl();
            console.log(`📍 當前 URL: ${currentUrl}`);
            
            // 診斷：列出頁面上的 h1 元素（不等待）
            const h1Elements = await $$('h1');
            console.log(`📊 頁面上有 ${h1Elements.length} 個 h1 元素`);
            for (let i = 0; i < h1Elements.length; i++) {
                const text = await h1Elements[i].getText();
                console.log(`  - H1[${i}]: "${text}"`);
            }
            
            // 檢查 input#name 是否存在
            const nameInputExists = await this.nameInput.isExisting();
            console.log(`🔍 input#name 存在: ${nameInputExists}`);
            
            if (nameInputExists) {
                const nameInputDisplayed = await this.nameInput.isDisplayed();
                console.log(`👁️ input#name 可見: ${nameInputDisplayed}`);
            }
        } catch (e) {
            console.error('❌ 診斷過程出錯:', e);
        }
        
        // 現在等待表單元素
        console.log('🔍 開始等待表單元素...');
        await this.nameInput.waitForDisplayed({ timeout: 10000 });
        console.log('✅ 表單已載入');
        
        // 填寫讀書會名稱
        await this.nameInput.waitForDisplayed();
        await this.nameInput.setValue(clubData.name);
        console.log(`✅ 已填寫名稱: ${clubData.name}`);
        
        // 填寫讀書會簡介
        if (clubData.description) {
            await this.descriptionTextarea.waitForDisplayed();
            await this.descriptionTextarea.setValue(clubData.description);
            console.log(`✅ 已填寫簡介: ${clubData.description.substring(0, 30)}...`);
        }
        
        // 設定可見性（預設為公開）
        const isPublic = clubData.isPublic !== undefined ? clubData.isPublic : true;
        if (isPublic) {
            await this.publicVisibilityButton.waitForClickable();
            await this.publicVisibilityButton.click();
            console.log('✅ 已設定為公開讀書會');
        } else {
            await this.privateVisibilityButton.waitForClickable();
            await this.privateVisibilityButton.click();
            console.log('✅ 已設定為私密讀書會');
        }
        
        // 等待標籤載入並選擇
        console.log('⏳ 等待標籤載入...');
        await this.waitForTagsLoaded();
        const tags = await this.tagButtons;
        console.log(`✅ 找到 ${tags.length} 個標籤`);
        
        if (tags.length > 0) {
            await tags[0].waitForClickable();
            await tags[0].click();
            const tagText = await tags[0].getText();
            console.log(`✅ 已選擇標籤: ${tagText}`);
        } else {
            console.warn('⚠️ 警告：沒有找到任何標籤');
        }
        
        // 點擊建立按鈕
        await this.submitButton.waitForClickable();
        console.log('⏳ 點擊建立按鈕...');
        await this.submitButton.click();
        
        // 等待一下讓表單提交
        await this.waitForHidden('.loading-spinner');
        
        // 檢查是否有真正的錯誤消息（過濾掉必填欄位的 * 標記）
        const errorMessages = await $$('.text-red-500, .error-message, [role="alert"]');
        if (errorMessages.length > 0) {
            const realErrors: string[] = [];
            for (const el of errorMessages) {
                const text = (await el.getText()).trim();
                // 過濾掉只有 * 或空白的元素（這些是必填欄位標記，不是錯誤）
                if (text && text !== '*') {
                    realErrors.push(text);
                }
            }
            if (realErrors.length > 0) {
                console.error('❌ 發現表單驗證錯誤:', realErrors.join(', '));
                throw new Error(`表單驗證失敗: ${realErrors.join(', ')}`);
            }
        }
        
        // 等待導航到讀書會詳情頁面（增加超時時間）
        console.log('⏳ 等待導航到讀書會詳情頁面...');
        const startTime = Date.now();
        let finalUrl = '';
        
        while (Date.now() - startTime < 10000) {
            finalUrl = await this.getCurrentUrl();
            if (finalUrl.includes('/clubs/') && !finalUrl.includes('/create')) {
                console.log(`✅ 成功導航到: ${finalUrl}`);
                return;
            }
            await this.waitForHidden('.loading-spinner');
        }
        
        // 如果 10 秒後還在建立頁面，拋出錯誤
        throw new Error(`導航超時：仍在 ${finalUrl}`);
    }

    /**
     * 取得當前頁面的讀書會 ID（從 URL）
     */
    async getCurrentClubId(): Promise<string> {
        const url = await this.getCurrentUrl();
        const match = url.match(/\/clubs\/(\d+)/);
        return match ? match[1] : '';
    }

    /**
     * 檢查是否在建立讀書會頁面
     */
    async isOnCreatePage(): Promise<boolean> {
        try {
            await this.pageTitle.waitForDisplayed({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }
}

export default new ClubCreatePage();
