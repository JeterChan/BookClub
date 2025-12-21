/// <reference types="@wdio/globals/types" />

import BasePage from './BasePage';

/**
 * ClubDetailPage - 讀書會詳情頁面物件
 */
class ClubDetailPage extends BasePage {
    // 選擇器 - 使用 *= 部分文字匹配（WebdriverIO 支援的語法）
    private get clubTitle() { return $('h1'); }
    private get clubDescription() { return $('.club-description, [data-testid="club-description"], p'); }
    private get joinButton() { return $('button*=加入'); }
    private get leaveButton() { return $('button*=退出'); }
    private get manageButton() { return $('button*=管理'); }
    private get memberCount() { return $('.member-count, [data-testid="member-count"]'); }
    private get discussionsTab() { return $('button*=討論'); }
    private get membersTab() { return $('button*=成員'); }
    private get eventsTab() { return $('button*=活動'); }
    private get membersList() { return $$('.member-item, [data-testid="member-item"]'); }
    private get discussionsList() { return $$('.discussion-item, [data-testid="discussion-item"]'); }
    private get createDiscussionButton() { return $('button*=建立討論'); }
    private get membershipStatus() { return $('.membership-status, [data-testid="membership-status"]'); }
    private get privateClubBadge() { return $('.private-badge, [data-testid="private-club"]'); }

    /**
     * 開啟讀書會詳情頁面
     * @param clubId - 讀書會 ID
     */
    async open(clubId: string) {
        await super.open(`/clubs/${clubId}`);
        await this.waitForVisible('h1');
    }

    /**
     * 取得讀書會標題
     */
    async getClubTitle(): Promise<string> {
        await this.clubTitle.waitForDisplayed();
        return await this.clubTitle.getText();
    }

    /**
     * 取得讀書會描述
     */
    async getClubDescription(): Promise<string> {
        try {
            await this.clubDescription.waitForDisplayed({ timeout: 5000 });
            return await this.clubDescription.getText();
        } catch {
            return '';
        }
    }

    /**
     * 加入讀書會
     */
    async joinClub() {
        await this.joinButton.waitForClickable();
        await this.joinButton.click();
        // 等待加入完成（按鈕變為 "退出" 或顯示成員狀態）
        await browser.pause(1000);
    }

    /**
     * 退出讀書會
     */
    async leaveClub() {
        await this.leaveButton.waitForClickable();
        await this.leaveButton.click();
        // 等待確認對話框（如果有）
        await browser.pause(500);
        // 確認退出
        const confirmButton = await $('button*=確認');
        if (await confirmButton.isExisting()) {
            await confirmButton.click();
        }
        await browser.pause(1000);
    }

    /**
     * 檢查加入按鈕是否可見
     */
    async isJoinButtonVisible(): Promise<boolean> {
        try {
            return await this.joinButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 檢查退出按鈕是否可見
     */
    async isLeaveButtonVisible(): Promise<boolean> {
        try {
            return await this.leaveButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 檢查管理按鈕是否可見（owner/admin 才能看到）
     */
    async isManageButtonVisible(): Promise<boolean> {
        try {
            return await this.manageButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 取得成員數量
     */
    async getMemberCount(): Promise<string> {
        try {
            await this.memberCount.waitForDisplayed({ timeout: 5000 });
            return await this.memberCount.getText();
        } catch {
            return '0';
        }
    }

    /**
     * 檢查討論頁籤是否可見
     */
    async isDiscussionsTabVisible(): Promise<boolean> {
        try {
            return await this.discussionsTab.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 切換到討論頁籤
     */
    async switchToDiscussionsTab() {
        await this.discussionsTab.click();
        await browser.pause(500);
    }

    /**
     * 切換到成員頁籤
     */
    async switchToMembersTab() {
        await this.membersTab.click();
        await browser.pause(500);
    }

    /**
     * 切換到活動頁籤
     */
    async switchToEventsTab() {
        await this.eventsTab.click();
        await browser.pause(500);
    }

    /**
     * 取得討論數量
     */
    async getDiscussionsCount(): Promise<number> {
        const discussions = await this.discussionsList;
        return discussions.length;
    }

    /**
     * 檢查建立討論按鈕是否可見
     * （只有會員才能看到）
     */
    async isCreateDiscussionButtonVisible(): Promise<boolean> {
        try {
            return await this.createDiscussionButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 點擊建立討論按鈕
     */
    async clickCreateDiscussion() {
        await this.createDiscussionButton.waitForClickable();
        await this.createDiscussionButton.click();
        await browser.pause(500);
    }

    /**
     * 取得成員身份狀態
     */
    async getMembershipStatus(): Promise<string> {
        try {
            await this.membershipStatus.waitForDisplayed({ timeout: 5000 });
            return await this.membershipStatus.getText();
        } catch {
            return '';
        }
    }

    /**
     * 檢查是否為私密讀書會
     */
    async isPrivateClub(): Promise<boolean> {
        try {
            return await this.privateClubBadge.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * 取得成員列表數量
     */
    async getMembersListCount(): Promise<number> {
        await this.switchToMembersTab();
        const members = await this.membersList;
        return members.length;
    }
}

export default new ClubDetailPage();
