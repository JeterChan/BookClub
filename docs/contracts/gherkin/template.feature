# language: zh-TW
Feature: [功能名稱]
  As a [角色]
  I want [目標]
  So that [價值/原因]

  Background:
    Given [共同的前提條件，如果有的話]

  Scenario: [場景描述 - 正常流程]
    Given [前提條件]
    And [額外的前提條件，如果需要]
    When [執行的動作]
    And [額外的動作，如果需要]
    Then [預期的結果]
    And [額外的驗證，如果需要]

  Scenario: [場景描述 - 錯誤處理]
    Given [前提條件]
    When [觸發錯誤的動作]
    Then [預期的錯誤訊息或行為]
    And [系統狀態保持不變的驗證]

  # 使用 Scenario Outline 處理多組測試資料
  Scenario Outline: [場景描述 - 多組資料]
    Given [前提條件]
    When I [動作] with "<input>"
    Then I should see "<expected>"

    Examples:
      | input       | expected          |
      | valid_data  | success_message   |
      | invalid_data| error_message     |

