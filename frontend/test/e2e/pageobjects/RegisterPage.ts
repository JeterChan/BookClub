import BasePage from './BasePage';

/**
 * RegisterPage - 註冊頁面物件
 */
class RegisterPage extends BasePage {
    // 選擇器
    private get nameInput() { return $('input[name="name"], input[placeholder*="名稱"]'); }
    private get emailInput() { return $('input[type="email"]'); }
    private get passwordInput() { return $('input[type="password"]').$$('..')[0]; }
    private get confirmPasswordInput() { return $('input[type="password"]').$$('..')[1]; }
    private get registerButton() { return $('button[type="submit"]'); }
    private get loginLink() { return $('a[href*="/login"]'); }
    private get errorMessage() { return $('.error-message, [role="alert"]'); }
    private get successMessage() { return $('.success-message'); }

    /**
     * 開啟註冊頁面
     */
    async open() {
        await super.open('/register');
        await this.waitForVisible('input[type="email"]');
    }

    /**
     * 執行註冊
     * @param name - 顯示名稱
     * @param email - Email 地址
     * @param password - 密碼
     * @param confirmPassword - 確認密碼
     */
    async register(name: string, email: string, password: string, confirmPassword: string) {
        await this.nameInput.waitForDisplayed();
        await this.nameInput.setValue(name);
        await this.emailInput.setValue(email);
        await this.passwordInput.setValue(password);
        await this.confirmPasswordInput.setValue(confirmPassword);
        await this.registerButton.click();
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
        try {
            return await this.errorMessage.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 點擊登入連結
     */
    async clickLoginLink() {
        await this.loginLink.click();
    }

    /**
     * 等待註冊成功
     */
    async waitForRegisterSuccess() {
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl();
                return url.includes('/dashboard') || url.includes('/login');
            },
            {
                timeout: 10000,
                timeoutMsg: 'Expected to be redirected after successful registration'
            }
        );
    }
}

export default new RegisterPage();
