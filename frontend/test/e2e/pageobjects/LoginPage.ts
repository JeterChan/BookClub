import BasePage from './BasePage';

/**
 * LoginPage - 登入頁面物件
 */
class LoginPage extends BasePage {
    // 選擇器
    private get emailInput() { return $('input[type="email"]'); }
    private get passwordInput() { return $('input[type="password"]'); }
    private get loginButton() { return $('button[type="submit"]'); }
    private get registerLink() { return $('a[href*="/register"]'); }
    private get errorMessage() { return $('.error-message, [role="alert"]'); }
    private get forgotPasswordLink() { return $('a[href*="/forgot-password"]'); }

    /**
     * 開啟登入頁面
     */
    async open() {
        await super.open('/login');
        await this.waitForVisible('input[type="email"]');
    }

    /**
     * 執行登入
     * @param email - Email 地址
     * @param password - 密碼
     */
    async login(email: string, password: string) {
        await this.emailInput.waitForDisplayed();
        await this.emailInput.setValue(email);
        await this.passwordInput.setValue(password);
        await this.loginButton.click();
        
        // 等待登入成功：URL 變更或不再在登入頁面
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl();
                return !url.includes('/login');
            },
            {
                timeout: 10000,
                timeoutMsg: '登入後頁面未跳轉'
            }
        );
        
        // 確保 token 已儲存到 localStorage
        await browser.waitUntil(
            async () => {
                const hasToken = await browser.execute(() => {
                    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
                    return !!token;
                });
                return hasToken;
            },
            {
                timeout: 5000,
                timeoutMsg: 'Token 未儲存到 localStorage'
            }
        );
    }

    /**
     * 取得錯誤訊息
     */
    async getErrorMessage(): Promise<string> {
        await this.errorMessage.waitForDisplayed({ timeout: 5000 });
        return await this.errorMessage.getText();
    }

    /**
     * 檢查是否有錯誤訊息
     */
    async hasErrorMessage(): Promise<boolean> {
        return await this.errorMessage.isDisplayed();
    }

    /**
     * 點擊註冊連結
     */
    async clickRegisterLink() {
        await this.registerLink.click();
    }

    /**
     * 點擊忘記密碼連結
     */
    async clickForgotPasswordLink() {
        await this.forgotPasswordLink.click();
    }

    /**
     * 等待登入成功（導向 welcome 或 dashboard）
     * 注意：Login.tsx 成功後會導向 /welcome，不是 /dashboard
     */
    async waitForLoginSuccess(timeout = 15000) {
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl();
                // 登入成功後會導向 /welcome（見 Login.tsx 第 55 行）
                return url.includes('/welcome') || url.includes('/dashboard');
            },
            {
                timeout,
                timeoutMsg: 'Expected to be redirected to /welcome or /dashboard after login'
            }
        );
    }
}

export default new LoginPage();
