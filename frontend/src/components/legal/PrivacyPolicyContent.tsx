export const PrivacyPolicyContent = () => {
  return (
    <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
      <p className="text-xs text-gray-500 mb-4">最後更新日期：2025年11月4日</p>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">1. 資料收集</h3>
        <p className="leading-relaxed mb-2">我們收集以下類型的資料：</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>帳號資料：</strong>顯示名稱、Email地址、密碼（加密儲存）</li>
          <li><strong>個人檔案：</strong>頭像、自我介紹、興趣標籤</li>
          <li><strong>使用資料：</strong>登入記錄、瀏覽記錄、互動行為</li>
          <li><strong>裝置資料：</strong>IP位址、瀏覽器類型、作業系統</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2. 資料使用目的</h3>
        <p className="leading-relaxed mb-2">我們使用您的資料用於：</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>提供和維護本平台服務</li>
          <li>處理您的帳號註冊和身份驗證</li>
          <li>改善使用者體驗和平台功能</li>
          <li>發送服務相關通知和更新</li>
          <li>提供個人化內容推薦</li>
          <li>偵測和防止欺詐或濫用行為</li>
          <li>遵守法律義務</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">3. 資料分享</h3>
        <p className="leading-relaxed mb-2">我們不會出售您的個人資料。我們僅在以下情況分享資料：</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>公開資訊：</strong>您的顯示名稱、頭像和公開的個人檔案資訊對其他用戶可見</li>
          <li><strong>服務提供商：</strong>與協助我們運營平台的第三方服務商（如雲端儲存、分析工具）</li>
          <li><strong>法律要求：</strong>遵守法律程序或政府要求</li>
          <li><strong>安全保護：</strong>保護本平台、用戶或公眾的權利和安全</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">4. 資料安全</h3>
        <p className="leading-relaxed mb-2">我們採取多種安全措施保護您的資料：</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>密碼使用加密雜湊演算法（bcrypt）儲存</li>
          <li>使用 HTTPS 加密傳輸</li>
          <li>定期安全審計和更新</li>
          <li>訪問控制和權限管理</li>
          <li>資料備份和災難恢復計劃</li>
        </ul>
        <p className="leading-relaxed mt-2">
          雖然我們盡力保護您的資料，但無法保證絕對安全。請妥善保管您的帳號密碼。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Cookies 和追蹤技術</h3>
        <p className="leading-relaxed mb-2">我們使用以下技術：</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>必要 Cookies：</strong>維持登入狀態和基本功能</li>
          <li><strong>分析 Cookies：</strong>了解使用者行為，改進服務</li>
          <li><strong>Local Storage：</strong>儲存用戶偏好設定</li>
        </ul>
        <p className="leading-relaxed mt-2">
          您可以通過瀏覽器設定管理 Cookies，但這可能影響某些功能的使用。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">6. 您的權利</h3>
        <p className="leading-relaxed mb-2">您對自己的個人資料擁有以下權利：</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>查閱權：</strong>查看我們持有的您的個人資料</li>
          <li><strong>更正權：</strong>更新或修改不正確的資料</li>
          <li><strong>刪除權：</strong>要求刪除您的帳號和資料</li>
          <li><strong>匯出權：</strong>以可攜式格式匯出您的資料</li>
          <li><strong>反對權：</strong>反對特定資料處理方式</li>
        </ul>
        <p className="leading-relaxed mt-2">
          如需行使這些權利，請聯繫我們的客服團隊。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">7. 兒童隱私</h3>
        <p className="leading-relaxed">
          本平台不針對13歲以下兒童。我們不會故意收集13歲以下兒童的個人資料。
          如果您發現我們收集了兒童的資料，請立即聯繫我們，我們將採取措施刪除該資料。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">8. 資料保留</h3>
        <p className="leading-relaxed">
          我們將保留您的個人資料，直到您刪除帳號或要求我們刪除為止。
          在某些情況下（如法律要求或爭議解決），我們可能需要保留資料更長時間。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">9. 國際資料傳輸</h3>
        <p className="leading-relaxed">
          您的資料可能被傳輸至並儲存在您所在國家/地區以外的伺服器。
          我們將確保採取適當的安全措施保護您的資料。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">10. 政策更新</h3>
        <p className="leading-relaxed">
          我們可能不時更新本隱私政策。重大變更將通過Email或平台通知告知您。
          繼續使用本平台即表示您接受更新後的隱私政策。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">11. 聯繫我們</h3>
        <p className="leading-relaxed mb-2">如您對本隱私政策有任何疑問或需要行使您的權利，請聯繫我們：</p>
        <div className="ml-4 space-y-1">
          <p><strong>Email:</strong> privacy@bookclub.com</p>
          <p><strong>客服支援:</strong> support@bookclub.com</p>
        </div>
      </section>
    </div>
  );
};
