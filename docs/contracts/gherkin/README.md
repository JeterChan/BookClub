# Gherkin Feature Files - 撰寫指南

**版本**: 1.0  
**最後更新**: 2025-10-22  
**擁有者**: PM John

---

## 📋 什麼是 Gherkin？

Gherkin 是一種商業可讀的領域特定語言(DSL)，讓您可以用自然語言描述軟體的行為，而不需要深入了解技術實作細節。

### 核心價值

- ✅ **清晰的驗收標準** - 明確定義 "完成" 的標準
- ✅ **跨團隊溝通** - PM、Dev、QA 都能理解
- ✅ **測試設計基礎** - 指導手動和自動化測試
- ✅ **活文件** - 隨代碼演進的需求文件

---

## 🎯 基本語法

### Feature (功能)

描述要測試的功能或使用者故事：

\`\`\`gherkin
Feature: 用戶註冊
  As a new user
  I want to register an account
  So that I can access the platform
\`\`\`

### Scenario (場景)

描述特定的測試情境：

\`\`\`gherkin
Scenario: 成功註冊使用有效資料
  Given I am on the registration page
  When I fill in "email" with "user@example.com"
  And I fill in "password" with "SecurePass123"
  And I click the "Register" button
  Then I should see "Registration successful"
\`\`\`

### Given-When-Then 結構

- **Given** (前提): 設定測試的初始狀態
- **When** (當): 執行的動作
- **Then** (那麼): 預期的結果

---

## 📝 撰寫最佳實踐

### 1. 使用商業語言，非技術語言

❌ **不好的範例**:
\`\`\`gherkin
When I send a POST request to "/api/auth/register" with payload {"email": "test@example.com"}
\`\`\`

✅ **好的範例**:
\`\`\`gherkin
When I register with email "test@example.com"
\`\`\`

### 2. 一個 Scenario 測試一件事

❌ **不好的範例** (測試太多):
\`\`\`gherkin
Scenario: 用戶註冊並更新檔案並建立讀書會
  Given I register a new account
  When I update my profile
  And I create a book club
  Then everything should work
\`\`\`

✅ **好的範例**:
\`\`\`gherkin
Scenario: 成功註冊新帳號
  Given I am on the registration page
  When I complete the registration form with valid data
  Then I should have a new account created
\`\`\`

### 3. 使用具體的範例

❌ **不好的範例** (太抽象):
\`\`\`gherkin
When I fill in the form with valid data
\`\`\`

✅ **好的範例**:
\`\`\`gherkin
When I fill in "email" with "user@example.com"
And I fill in "password" with "SecurePass123"
And I fill in "displayName" with "John Doe"
\`\`\`

### 4. 保持步驟獨立

每個步驟應該可以獨立理解，不依賴前一個步驟的隱含資訊。

---

## 🗂️ 檔案命名規範

### 格式

\`{story-id}-{feature-name}.feature\`

### 範例

- \`1.1-user-registration.feature\`
- \`1.2-user-login.feature\`
- \`2.1-create-book-club.feature\`

### 目錄結構

\`\`\`
docs/contracts/gherkin/
├── README.md
├── template.feature
├── epic-1/
│   ├── 1.1-user-registration.feature
│   ├── 1.2-user-login.feature
│   └── ...
└── epic-2/
    ├── 2.1-create-club.feature
    └── ...
\`\`\`

---

## 📄 完整範例

\`\`\`gherkin
Feature: 用戶登入
  As a registered user
  I want to log in to my account
  So that I can access my personalized dashboard

  Background:
    Given a user exists with email "john@example.com" and password "SecurePass123"

  Scenario: 成功登入使用正確的認證資訊
    Given I am on the login page
    When I fill in "email" with "john@example.com"
    And I fill in "password" with "SecurePass123"
    And I click the "Login" button
    Then I should be redirected to "/dashboard"
    And I should see "Welcome back, John"

  Scenario: 登入失敗使用錯誤的密碼
    Given I am on the login page
    When I fill in "email" with "john@example.com"
    And I fill in "password" with "WrongPassword"
    And I click the "Login" button
    Then I should see an error message "Invalid email or password"
    And I should remain on the login page

  Scenario: 帳號鎖定在多次失敗嘗試後
    Given I have failed to log in 4 times
    When I attempt to log in with incorrect password again
    Then I should see "Account temporarily locked"
    And I should not be able to log in for 15 minutes
\`\`\`

---

## 🌐 語言選擇

### 使用中文或英文？

**建議**: 保持一致性

- **中文**: 如果團隊主要使用中文溝通
- **英文**: 如果需要國際化或與國外團隊協作
- **混合**: 避免！選擇一種語言並全專案統一使用

本專案使用 **中文** 作為 Gherkin 語言。

---

## 🔄 Gherkin 與自動化測試

### 當前狀態：純文件

目前 Gherkin Features 作為 **純文件**：

- 用於溝通驗收標準
- 指導測試設計
- 不自動執行

### 未來可選：自動化執行

如需自動化，可使用 **pytest-bdd**：

\`\`\`python
# tests/test_user_registration.py
from pytest_bdd import scenarios, given, when, then

scenarios('gherkin/epic-1/1.1-user-registration.feature')

@given('I am on the registration page')
def on_registration_page(page):
    page.goto('/register')

@when('I fill in "email" with "user@example.com"')
def fill_email(page):
    page.fill('input[name="email"]', 'user@example.com')

# ... more steps
\`\`\`

但這不是必須的！Gherkin 純文件已經很有價值。

---

## 📚 相關資源

- [Gherkin Template](template.feature) - 可複製的模板
- [Cucumber Documentation](https://cucumber.io/docs/gherkin/) - Gherkin 官方文件
- [Writing Better Gherkin](https://cucumber.io/docs/bdd/better-gherkin/) - 撰寫技巧

---

## 🆘 需要幫助？

如果對 Gherkin 撰寫有任何疑問，請參考：

1. [template.feature](template.feature) - 起始模板
2. [Epic 1 範例](epic-1/) - 實際的 Feature 文件範例
3. 聯繫 PM John

---

**建立日期**: 2025-10-22  
**維護者**: PM John  
**版本**: 1.0
