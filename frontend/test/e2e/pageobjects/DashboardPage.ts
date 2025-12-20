import BasePage from './BasePage';

/**
 * DashboardPage - 儀表板頁面物件
 */
class DashboardPage extends BasePage {
    // 選擇器
    private get welcomeMessage() { return $('h1, h2'); }
    private get userName() { return $('[data-testid="user-name"], .user-name'); }
    private get logoutButton() { return $('button:has-text("登出"), button:has-text("Logout")'); }
    private get exploreClubsLink() { return $('a[href*="/clubs"]'); }
    private get profileLink() { return $('a[href*="/profile"]'); }
    private get notificationBell() { return $('[data-testid="notification-bell"], .notification-icon'); }
    private get recentActivities() { return $('.recent-activities, [data-testid="recent-activities"]'); }

    /**
     * 開啟儀表板頁面
     */
    async open() {
        await super.open('/dashboard');
        await this.waitForVisible('h1, h2', 15000);
    }

    /**
     * 檢查是否成功登入（顯示歡迎訊息）
     */
    async isLoggedIn(): Promise<boolean> {
        try {
            await this.welcomeMessage.waitForDisplayed({ timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 取得歡迎訊息
     */
    async getWelcomeMessage(): Promise<string> {
        await this.welcomeMessage.waitForDisplayed();
        return await this.welcomeMessage.getText();
    }

    /**
     * 取得用戶名稱
     */
    async getUserName(): Promise<string> {
        try {
            await this.userName.waitForDisplayed({ timeout: 5000 });
            return await this.userName.getText();
        } catch {
            return '';
        }
    }

    /**
     * 登出
     */
    async logout() {
        try {
            await this.logoutButton.waitForClickable({ timeout: 5000 });
            await this.logoutButton.click();
            await this.waitForNavigation('/login');
        } catch (error) {
            console.warn('Logout button not found, trying alternative method');
            await this.clearLocalStorage();
            await this.open();
        }
    }

    /**
     * 導航到探索讀書會
     */
    async navigateToExploreClubs() {
        await this.exploreClubsLink.click();
        await this.waitForNavigation('/clubs');
    }

    /**
     * 導航到個人檔案
     */
    async navigateToProfile() {
        await this.profileLink.click();
        await this.waitForNavigation('/profile');
    }

    /**
     * 檢查是否有最近活動
     */
    async hasRecentActivities(): Promise<boolean> {
        try {
            return await this.recentActivities.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 檢查通知鈴鐺是否存在
     */
    async hasNotificationBell(): Promise<boolean> {
        try {
            return await this.notificationBell.isDisplayed();
        } catch {
            return false;
        }
    }
}

export default new DashboardPage();
