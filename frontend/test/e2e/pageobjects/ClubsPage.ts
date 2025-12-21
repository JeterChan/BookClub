import BasePage from './BasePage';

/**
 * ClubsPage - 讀書會探索頁面物件
 * 對應頁面: ClubExplore.tsx
 */
class ClubsPage extends BasePage {
    // 選擇器 - 根據 ClubExplore.tsx 和 ClubCard.tsx 的實際結構
    private get pageTitle() { return $('h1'); }
    private get searchInput() { return $('input[type="text"], input[placeholder*="搜尋"]'); }
    // ClubCard 使用 role="article" 的 div
    private get clubCards() { return $$('[role="article"]'); }
    // 建立讀書會按鈕是一個 button，內含「建立讀書會」文字
    private get createClubButton() { return $('button*=建立讀書會'); }
    private get filterButtons() { return $$('button[class*="tag"], button[class*="filter"]'); }
    private get emptyState() { return $('div*=沒有找到符合條件的讀書會'); }
    private get loadingSpinner() { return $('div*=載入中'); }

    /**
     * 開啟讀書會探索頁面
     */
    async open() {
        await super.open('/clubs');
        await this.waitForVisible('h1, h2');
    }

    /**
     * 搜尋讀書會
     * @param keyword - 搜尋關鍵字
     */
    async searchClubs(keyword: string) {
        await this.searchInput.waitForDisplayed();
        await this.searchInput.setValue(keyword);
        await browser.keys('Enter');
        // 等待搜尋結果更新
        await browser.pause(1000);
    }

    /**
     * 取得讀書會卡片數量
     */
    async getClubCardsCount(): Promise<number> {
        try {
            await this.waitForHidden('.loading, .spinner', 5000);
        } catch {
            // 沒有 loading 也沒關係
        }
        
        const cards = await this.clubCards;
        return cards.length;
    }

    /**
     * 點擊第一個讀書會卡片
     */
    async clickFirstClub() {
        const cards = await this.clubCards;
        if (cards.length > 0) {
            await cards[0].click();
            await this.waitForNavigation('/clubs/');
        }
    }

    /**
     * 點擊指定索引的讀書會卡片
     * @param index - 卡片索引（從 0 開始）
     */
    async clickClubByIndex(index: number) {
        const cards = await this.clubCards;
        if (index < cards.length) {
            await cards[index].click();
            await this.waitForNavigation('/clubs/');
        }
    }

    /**
     * 點擊建立讀書會按鈕
     */
    async clickCreateClub() {
        await this.createClubButton.waitForClickable();
        await this.createClubButton.click();
        await this.waitForNavigation('/clubs/create');
    }

    /**
     * 檢查是否顯示空狀態（沒有讀書會）
     */
    async isEmptyStateDisplayed(): Promise<boolean> {
        try {
            return await this.emptyState.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 檢查建立讀書會按鈕是否可見
     * （訪客應該看不到此按鈕）
     */
    async isCreateClubButtonVisible(): Promise<boolean> {
        try {
            return await this.createClubButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 取得第一個讀書會的標題
     */
    async getFirstClubTitle(): Promise<string> {
        const cards = await this.clubCards;
        if (cards.length > 0) {
            // ClubCard 的標題是 h3 元素
            const titleElement = await cards[0].$('h3');
            return await titleElement.getText();
        }
        return '';
    }

    /**
     * 點擊第一個讀書會的「查看詳情」按鈕
     */
    async clickFirstClubViewDetails() {
        const cards = await this.clubCards;
        if (cards.length > 0) {
            // ClubCard 內有「查看詳情」按鈕
            const viewButton = await cards[0].$('button*=查看詳情');
            await viewButton.click();
            await browser.pause(1000);
        }
    }

    /**
     * 等待讀書會列表載入完成
     */
    async waitForClubsLoaded() {
        try {
            await this.loadingSpinner.waitForDisplayed({ timeout: 2000 });
            await this.loadingSpinner.waitForDisplayed({ timeout: 10000, reverse: true });
        } catch {
            // 如果沒有 loading spinner，等待一下確保內容載入
            await browser.pause(500);
        }
    }

    /**
     * 根據讀書會名稱查找其 ID
     * @param clubName - 讀書會名稱
     * @returns 讀書會 ID，如果找不到則返回 null
     */
    async findClubIdByName(clubName: string): Promise<string | null> {
        console.log(`🔍 開始搜尋讀書會: ${clubName}`);
        
        // 等待頁面載入
        await this.waitForClubsLoaded();
        
        // 獲取所有讀書會卡片
        const cards = await this.clubCards;
        console.log(`📊 找到 ${cards.length} 個讀書會卡片`);
        
        for (let i = 0; i < cards.length; i++) {
            try {
                // 獲取卡片的標題 (h3 元素)
                const titleElement = await cards[i].$('h3');
                const title = await titleElement.getText();
                console.log(`  檢查讀書會 ${i + 1}: "${title}"`);
                
                // 使用部分匹配：只要標題包含搜尋字串即可
                if (title.includes(clubName)) {
                    // 找到匹配的讀書會，點擊「查看詳情」按鈕獲取 ID
                    console.log(`  ✅ 找到匹配的讀書會！(部分匹配: "${title}" 包含 "${clubName}")`);
                    const viewButton = await cards[i].$('button=查看詳情');
                    await viewButton.click();
                    console.log(`  ⏳ 已點擊按鈕，等待頁面導航...`);
                    
                    // 等待 URL 變化（最多等待 5 秒）
                    await browser.waitUntil(
                        async () => {
                            const currentUrl = await browser.getUrl();
                            return currentUrl.includes('/clubs/') && currentUrl !== 'http://localhost:5174/clubs';
                        },
                        {
                            timeout: 5000,
                            timeoutMsg: '等待頁面導航超時'
                        }
                    );
                    
                    const url = await this.getCurrentUrl();
                    console.log(`  📍 當前 URL: ${url}`);
                    
                    // 從 URL 中提取 ID (格式: /clubs/123 或 /clubs/123/...)
                    const match = url.match(/\/clubs\/(\d+)/);
                    if (match && match[1]) {
                        const clubId = match[1];
                        console.log(`  🎯 成功獲取讀書會 ID: ${clubId}`);
                        return clubId;
                    }
                }
            } catch (error) {
                console.log(`  ⚠️ 檢查卡片 ${i + 1} 時發生錯誤:`, error);
                continue;
            }
        }
        
        console.log(`  ❌ 未找到名為「${clubName}」的讀書會`);
        return null;
    }
}

export default new ClubsPage();
