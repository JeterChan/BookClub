/**
 * BasePage - 所有頁面物件的基礎類別
 * 提供通用的頁面操作方法
 */
export default class BasePage {
    /**
     * 開啟指定路徑
     * @param path - 相對於 baseUrl 的路徑
     */
    async open(path: string) {
        await browser.url(path);
    }

    /**
     * 等待元素可見
     * @param selector - 元素選擇器
     * @param timeout - 超時時間（毫秒）
     */
    async waitForVisible(selector: string, timeout: number = 10000) {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout });
    }

    /**
     * 等待元素消失
     * @param selector - 元素選擇器
     * @param timeout - 超時時間（毫秒）
     */
    async waitForHidden(selector: string, timeout: number = 10000) {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout, reverse: true });
    }

    /**
     * 點擊元素
     * @param selector - 元素選擇器
     */
    async click(selector: string) {
        const element = await $(selector);
        await element.waitForClickable();
        await element.click();
    }

    /**
     * 輸入文字
     * @param selector - 元素選擇器
     * @param text - 要輸入的文字
     */
    async setValue(selector: string, text: string) {
        const element = await $(selector);
        await element.waitForDisplayed();
        await element.setValue(text);
    }

    /**
     * 取得元素文字
     * @param selector - 元素選擇器
     */
    async getText(selector: string): Promise<string> {
        const element = await $(selector);
        await element.waitForDisplayed();
        return await element.getText();
    }

    /**
     * 檢查元素是否存在
     * @param selector - 元素選擇器
     */
    async isElementExisting(selector: string): Promise<boolean> {
        const element = await $(selector);
        return await element.isExisting();
    }

    /**
     * 檢查元素是否可見
     * @param selector - 元素選擇器
     */
    async isElementDisplayed(selector: string): Promise<boolean> {
        const element = await $(selector);
        return await element.isDisplayed();
    }

    /**
     * 截圖
     * @param filename - 檔案名稱
     */
    async takeScreenshot(filename: string) {
        await browser.saveScreenshot(`./test/e2e/screenshots/${filename}`);
    }

    /**
     * 等待導航完成
     * @param expectedUrl - 預期的 URL（可選）
     */
    async waitForNavigation(expectedUrl?: string) {
        if (expectedUrl) {
            await browser.waitUntil(
                async () => (await browser.getUrl()).includes(expectedUrl),
                {
                    timeout: 10000,
                    timeoutMsg: `Expected URL to contain ${expectedUrl}`
                }
            );
        } else {
            await browser.pause(500); // 等待頁面穩定
        }
    }

    /**
     * 滾動到元素位置
     * @param selector - 元素選擇器
     */
    async scrollToElement(selector: string) {
        const element = await $(selector);
        await element.scrollIntoView();
    }

    /**
     * 清除 LocalStorage
     */
    async clearLocalStorage() {
        await browser.execute(() => {
            localStorage.clear();
        });
    }

    /**
     * 取得當前 URL
     */
    async getCurrentUrl(): Promise<string> {
        return await browser.getUrl();
    }

    /**
     * 重新載入頁面
     */
    async refresh() {
        await browser.refresh();
    }
}
