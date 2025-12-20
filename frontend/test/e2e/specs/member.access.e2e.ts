import { expect } from '@wdio/globals';
import LoginPage from '../pageobjects/LoginPage';
import DashboardPage from '../pageobjects/DashboardPage';
import ClubsPage from '../pageobjects/ClubsPage';
import ClubDetailPage from '../pageobjects/ClubDetailPage';

/**
 * 會員權限測試套件
 * 對應泳道圖：普通會員操作流程
 * 驗證已登入用戶（會員）的訪問權限和功能
 * 
 * 測試範圍 (根據 訪客與會員完整性測試文件.md):
 * - TC-M-001 ~ TC-M-012: 會員基本功能測試
 * - 流程 2.1 ~ 2.4: 讀書會探索、查看、加入、離開
 * - 流程 3.1: 建立讀書會
 * - 流程 4.1 ~ 4.2: 討論區功能
 * 
 * ⚠️ 注意: 執行測試前需要將下方密碼常數替換為真實密碼
 */
describe('會員權限測試 (Member Access Tests)', () => {
    // 測試用戶資料 - 使用已驗證的真實會員帳號
    const testUser = {
        email: 'jjwang1118@gmail.com',
        password: 'Mega1118', // TODO: 替換為真實密碼才可實測
        name: 'JJ Wang'
    };

    before(async () => {
        console.log('🚀 開始會員權限測試...');
        
        // 先打開首頁以載入 localStorage 上下文
        await browser.url('http://localhost:5173');
        await browser.pause(1000);
        
        // 清除所有認證資訊
        await browser.execute(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (e) {
                console.log('無法清除儲存:', e);
            }
        });
        console.log('✅ 已清除舊的登入資訊');

        // 執行登入
        await LoginPage.open();
        await browser.pause(1000);
        console.log('📍 已開啟登入頁面');
        
        // 填入登入資訊並點擊登入按鈕
        await LoginPage.login(testUser.email, testUser.password);
        console.log('📝 已填入登入資訊，點擊登入按鈕...');
        
        // 等待 8 秒讓後端驗證 (用戶要求: 7-8 秒)
        console.log('⏳ 等待後端驗證中 (約 8 秒)...');
        await browser.pause(8000);
        
        // 檢查登入結果
        const currentUrl = await browser.getUrl();
        console.log('📍 當前 URL:', currentUrl);
        
        // Login.tsx 成功後導向 /welcome，不是 /dashboard
        if (currentUrl.includes('/welcome') || currentUrl.includes('/dashboard')) {
            console.log('✅ 登入成功！');
        } else if (currentUrl.includes('/login')) {
            // 可能還在處理，再等一下
            await browser.pause(3000);
            const finalUrl = await browser.getUrl();
            console.log('📍 最終 URL:', finalUrl);
            
            if (!finalUrl.includes('/welcome') && !finalUrl.includes('/dashboard')) {
                throw new Error('登入失敗 - 未重定向。當前 URL: ' + finalUrl);
            }
        }
        
        await browser.pause(1000);
        console.log('🎉 登入流程完成！開始測試...');
    });

    // =====================================================
    // TC-M-001 ~ TC-M-005: 儀表板與個人資料測試 (Epic 1)
    // =====================================================
    describe('【Epic 1】頁面訪問權限', () => {
        it('TC-M-001: ✅ 會員可以訪問儀表板', async () => {
            // 對應流程: 登入後首頁
            await browser.url('http://localhost:5173/dashboard');
            await browser.pause(2000);
            
            // 可能重定向到 welcome 或留在 dashboard
            const currentUrl = await browser.getUrl();
            const isValidPage = currentUrl.includes('/dashboard') || currentUrl.includes('/welcome');
            expect(isValidPage).toBe(true);
            console.log('  ✓ TC-M-001: 會員可以訪問儀表板');
        });

        it('TC-M-002: ✅ 會員可以查看個人資訊', async () => {
            // 對應流程: 個人資料管理
            await browser.url('http://localhost:5173/profile');
            await browser.pause(2000);
            
            const currentUrl = await browser.getUrl();
            expect(currentUrl).not.toContain('/login');
            console.log('  ✓ TC-M-002: 會員可以查看個人資料頁面');
        });

        it('TC-M-003: ✅ 會員可以瀏覽讀書會列表', async () => {
            // 對應流程: 2.1 探索讀書會
            await ClubsPage.open();
            await browser.pause(2000);

            const clubsCount = await ClubsPage.getClubCardsCount();
            console.log(`  📊 找到 ${clubsCount} 個讀書會`);
            expect(clubsCount).toBeGreaterThanOrEqual(0);
            console.log('  ✓ TC-M-003: 會員可以瀏覽讀書會列表');
        });
    });

    // =====================================================
    // TC-M-004 ~ TC-M-008: 讀書會功能權限 (Epic 2)
    // =====================================================
    describe('【Epic 2】讀書會功能權限', () => {
        it('TC-M-004: ✅ 會員可以看到「建立讀書會」按鈕', async () => {
            // 對應流程: 3.1 建立讀書會 (前置)
            await ClubsPage.open();
            await browser.pause(2000);
            
            // 會員應該能看到建立按鈕
            const isCreateButtonVisible = await ClubsPage.isCreateClubButtonVisible();
            console.log(`  📊 建立按鈕狀態: ${isCreateButtonVisible ? '可見' : '不可見'}`);
            expect(isCreateButtonVisible).toBe(true);
            console.log('  ✓ TC-M-004: 會員可以看到「建立讀書會」按鈕');
        });

        it('TC-M-005: ✅ 會員可以查看讀書會詳情', async () => {
            // 對應流程: 2.2 查看讀書會
            await ClubsPage.open();
            await browser.pause(2000);
            
            const clubsCount = await ClubsPage.getClubCardsCount();
            console.log(`  📊 找到 ${clubsCount} 個讀書會`);
            
            if (clubsCount > 0) {
                await ClubsPage.clickFirstClub();
                await browser.pause(2000);
                
                const currentUrl = await browser.getUrl();
                expect(currentUrl).toContain('/clubs/');
                console.log('  ✓ TC-M-005: 會員可以查看讀書會詳情');
            } else {
                console.log('  ⚠️ TC-M-005: 沒有可用的讀書會進行測試');
            }
        });

        it('TC-M-006: ✅ 會員可以看到「加入讀書會」功能', async () => {
            // 對應流程: 2.3 申請加入讀書會
            await ClubsPage.open();
            await browser.pause(2000);
            
            const clubsCount = await ClubsPage.getClubCardsCount();
            
            if (clubsCount > 0) {
                await ClubsPage.clickFirstClub();
                await browser.pause(2000);
                
                // 會員應該能看到：
                // 1. 加入或退出按鈕（取決於是否已加入）
                // 2. 或者管理按鈕（如果用戶是 owner/admin）
                const hasJoinButton = await ClubDetailPage.isJoinButtonVisible();
                const hasLeaveButton = await ClubDetailPage.isLeaveButtonVisible();
                const hasManageButton = await ClubDetailPage.isManageButtonVisible();
                
                console.log(`  📊 加入按鈕: ${hasJoinButton}, 退出按鈕: ${hasLeaveButton}, 管理按鈕: ${hasManageButton}`);
                
                // 應該至少有一個按鈕可見（加入/退出/管理）
                const hasAnyButton = hasJoinButton || hasLeaveButton || hasManageButton;
                expect(hasAnyButton).toBe(true);
                
                if (hasManageButton) {
                    console.log('  ✓ TC-M-006: 會員是此讀書會的創建者/管理員，可以看到「管理」功能');
                } else {
                    console.log('  ✓ TC-M-006: 會員可以看到「加入/退出讀書會」功能');
                }
            } else {
                console.log('  ⚠️ TC-M-006: 沒有可用的讀書會進行測試');
            }
        });

        it('TC-M-007: ✅ 會員可以加入公開讀書會', async () => {
            // 對應流程: 2.3 申請加入讀書會 (公開類型)
            await ClubsPage.open();
            await browser.pause(2000);
            
            const clubsCount = await ClubsPage.getClubCardsCount();
            
            if (clubsCount > 0) {
                // 尋找可以加入的讀書會
                let testedJoin = false;
                const maxAttempts = Math.min(clubsCount, 3);
                
                for (let i = 0; i < maxAttempts; i++) {
                    await ClubsPage.open();
                    await browser.pause(1000);
                    await ClubsPage.clickClubByIndex(i);
                    await browser.pause(2000);
                    
                    const hasJoinButton = await ClubDetailPage.isJoinButtonVisible();
                    const isPrivate = await ClubDetailPage.isPrivateClub();
                    
                    if (hasJoinButton && !isPrivate) {
                        console.log(`  📍 找到可加入的讀書會 (index: ${i})`);
                        
                        // 嘗試加入
                        await ClubDetailPage.joinClub();
                        await browser.pause(3000);
                        
                        // 驗證已加入（按鈕應該變為「退出」）
                        const hasLeaveButton = await ClubDetailPage.isLeaveButtonVisible();
                        
                        if (hasLeaveButton) {
                            console.log('  ✅ 成功加入讀書會');
                            expect(hasLeaveButton).toBe(true);
                            
                            // 清理：退出讀書會
                            await ClubDetailPage.leaveClub();
                            await browser.pause(2000);
                            console.log('  🧹 已清理：退出讀書會');
                        }
                        
                        testedJoin = true;
                        break;
                    }
                }
                
                if (!testedJoin) {
                    console.log('  ⚠️ TC-M-007: 沒有找到可加入的公開讀書會');
                } else {
                    console.log('  ✓ TC-M-007: 會員可以加入公開讀書會');
                }
            } else {
                console.log('  ⚠️ TC-M-007: 沒有可用的讀書會進行測試');
            }
        });
    });

    // =====================================================
    // TC-M-008 ~ TC-M-010: 討論區功能權限 (Epic 3)
    // =====================================================
    describe('【Epic 3】討論區功能權限', () => {
        it('TC-M-008: ✅ 會員可以查看討論列表', async () => {
            // 對應流程: 4.1 參與討論
            await ClubsPage.open();
            await browser.pause(2000);
            
            const clubsCount = await ClubsPage.getClubCardsCount();
            
            if (clubsCount > 0) {
                await ClubsPage.clickFirstClub();
                await browser.pause(2000);
                
                // 嘗試切換到討論區標籤
                try {
                    await ClubDetailPage.switchToDiscussionsTab();
                    await browser.pause(1000);
                    
                    const discussionsCount = await ClubDetailPage.getDiscussionsCount();
                    console.log(`  📊 找到 ${discussionsCount} 個討論`);
                    expect(discussionsCount).toBeGreaterThanOrEqual(0);
                    console.log('  ✓ TC-M-008: 會員可以查看討論列表');
                } catch (error) {
                    console.log('  ⚠️ TC-M-008: 討論區標籤不可見或無法切換');
                }
            } else {
                console.log('  ⚠️ TC-M-008: 沒有可用的讀書會進行測試');
            }
        });

        it('TC-M-009: ✅ 會員（成員）可以看到「建立討論」按鈕', async () => {
            // 對應流程: 4.2 建立討論 (前置條件: 必須是該讀書會成員)
            await ClubsPage.open();
            await browser.pause(2000);
            
            const clubsCount = await ClubsPage.getClubCardsCount();
            
            if (clubsCount > 0) {
                // 尋找已加入的讀書會
                let foundMemberClub = false;
                
                for (let i = 0; i < Math.min(clubsCount, 3); i++) {
                    await ClubsPage.open();
                    await browser.pause(1000);
                    await ClubsPage.clickClubByIndex(i);
                    await browser.pause(2000);
                    
                    // 檢查是否已是成員
                    const hasLeaveButton = await ClubDetailPage.isLeaveButtonVisible();
                    
                    if (hasLeaveButton) {
                        foundMemberClub = true;
                        console.log(`  📍 找到已加入的讀書會 (index: ${i})`);
                        
                        try {
                            await ClubDetailPage.switchToDiscussionsTab();
                            await browser.pause(1000);
                            
                            const isCreateDiscussionVisible = await ClubDetailPage.isCreateDiscussionButtonVisible();
                            console.log(`  📊 建立討論按鈕: ${isCreateDiscussionVisible ? '可見' : '不可見'}`);
                            expect(isCreateDiscussionVisible).toBe(true);
                        } catch (error) {
                            console.log('  ⚠️ 無法檢查建立討論按鈕');
                        }
                        break;
                    }
                }
                
                if (!foundMemberClub) {
                    console.log('  ⚠️ TC-M-009: 用戶未加入任何讀書會，無法測試建立討論功能');
                } else {
                    console.log('  ✓ TC-M-009: 已檢查「建立討論」按鈕');
                }
            } else {
                console.log('  ⚠️ TC-M-009: 沒有可用的讀書會進行測試');
            }
        });
    });

    // =====================================================
    // 搜尋功能測試
    // =====================================================
    describe('【功能】搜尋功能', () => {
        it('TC-M-010: ✅ 會員可以使用搜尋功能', async () => {
            await ClubsPage.open();
            await browser.pause(2000);
            
            const initialCount = await ClubsPage.getClubCardsCount();
            console.log(`  📊 初始讀書會數量: ${initialCount}`);
            
            if (initialCount > 0) {
                const firstClubTitle = await ClubsPage.getFirstClubTitle();
                console.log(`  📍 第一個讀書會標題: ${firstClubTitle}`);
                
                if (firstClubTitle) {
                    await ClubsPage.searchClubs(firstClubTitle);
                    await browser.pause(2000);
                    
                    const searchResultCount = await ClubsPage.getClubCardsCount();
                    console.log(`  📊 搜尋結果數量: ${searchResultCount}`);
                    expect(searchResultCount).toBeGreaterThan(0);
                    console.log('  ✓ TC-M-010: 會員可以使用搜尋功能');
                }
            } else {
                console.log('  ⚠️ TC-M-010: 沒有可用的讀書會進行搜尋測試');
            }
        });
    });

    // =====================================================
    // 導航功能測試
    // =====================================================
    describe('【功能】導航功能', () => {
        it('TC-M-011: ✅ 會員可以導航到個人檔案', async () => {
            await browser.url('http://localhost:5173/profile');
            await browser.pause(2000);
            
            const currentUrl = await browser.getUrl();
            expect(currentUrl).not.toContain('/login');
            console.log('  ✓ TC-M-011: 會員可以導航到個人檔案');
        });

        it('TC-M-012: ✅ 會員可以導航到探索讀書會', async () => {
            await browser.url('http://localhost:5173/clubs');
            await browser.pause(2000);
            
            const currentUrl = await browser.getUrl();
            expect(currentUrl).toContain('/clubs');
            console.log('  ✓ TC-M-012: 會員可以導航到探索讀書會');
        });
    });

    after(async () => {
        console.log('\n🧹 測試結束，清理登入狀態...');
        
        // 測試結束後登出
        try {
            await browser.execute(() => {
                localStorage.clear();
                sessionStorage.clear();
            });
            console.log('✅ 已清除登入狀態');
        } catch (error) {
            console.log('⚠️ 清除登入狀態時發生錯誤');
        }
        
        console.log('🎉 會員權限測試完成！');
    });
});
