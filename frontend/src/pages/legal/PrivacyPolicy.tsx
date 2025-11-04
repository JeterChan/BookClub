import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link to="/register" className="text-blue-600 hover:underline text-sm">
            ← 返回註冊頁面
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">隱私政策</h1>
        <p className="text-sm text-gray-600 mb-8">最後更新日期：2025年11月4日</p>

        <div className="prose prose-blue max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. 資料收集</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>我們收集以下類型的資料：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>帳號資料：</strong>顯示名稱、Email地址、密碼（加密儲存）</li>
                <li><strong>個人檔案：</strong>頭像、自我介紹、興趣標籤</li>
                <li><strong>使用資料：</strong>登入記錄、瀏覽記錄、互動行為</li>
                <li><strong>裝置資料：</strong>IP位址、瀏覽器類型、作業系統</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. 資料使用目的</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>我們使用您的資料用於：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>提供和維護本平台服務</li>
                <li>處理您的帳號註冊和身份驗證</li>
                <li>改善使用者體驗和平台功能</li>
                <li>發送服務相關通知和更新</li>
                <li>提供個人化內容推薦</li>
                <li>偵測和防止欺詐或濫用行為</li>
                <li>遵守法律義務</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. 資料分享</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>我們不會出售您的個人資料。我們僅在以下情況分享資料：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>公開資訊：</strong>您的顯示名稱、頭像和公開的個人檔案資訊對其他用戶可見</li>
                <li><strong>服務提供商：</strong>與協助我們運營平台的第三方服務商（如雲端儲存、分析工具）</li>
                <li><strong>法律要求：</strong>遵守法律程序或政府要求</li>
                <li><strong>安全保護：</strong>保護本平台、用戶或公眾的權利和安全</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. 資料安全</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>我們採取多種安全措施保護您的資料：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>密碼使用加密雜湊演算法（bcrypt）儲存</li>
                <li>使用 HTTPS 加密傳輸</li>
                <li>定期安全審計和更新</li>
                <li>訪問控制和權限管理</li>
                <li>資料備份和災難恢復計劃</li>
              </ul>
              <p className="mt-2">
                雖然我們盡力保護您的資料，但無法保證絕對安全。請妥善保管您的帳號密碼。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Cookies 和追蹤技術</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>我們使用以下技術：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>必要 Cookies：</strong>維持登入狀態和基本功能</li>
                <li><strong>分析 Cookies：</strong>了解使用者行為，改進服務</li>
                <li><strong>Local Storage：</strong>儲存用戶偏好設定</li>
              </ul>
              <p className="mt-2">
                您可以通過瀏覽器設定管理 Cookies，但這可能影響某些功能的使用。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. 您的權利</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>您對自己的個人資料擁有以下權利：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>查閱權：</strong>查看我們持有的您的個人資料</li>
                <li><strong>更正權：</strong>更新或修改不正確的資料</li>
                <li><strong>刪除權：</strong>要求刪除您的帳號和資料</li>
                <li><strong>匯出權：</strong>以可攜式格式匯出您的資料</li>
                <li><strong>反對權：</strong>反對特定資料處理方式</li>
              </ul>
              <p className="mt-2">
                如需行使這些權利，請聯繫我們的客服團隊。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. 兒童隱私</h2>
            <p className="text-gray-700 leading-relaxed">
              本平台不針對13歲以下兒童。我們不會故意收集13歲以下兒童的個人資料。
              如果您發現我們收集了兒童的資料，請立即聯繫我們，我們將採取措施刪除該資料。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. 資料保留</h2>
            <p className="text-gray-700 leading-relaxed">
              我們將保留您的個人資料，直到您刪除帳號或要求我們刪除為止。
              在某些情況下（如法律要求或爭議解決），我們可能需要保留資料更長時間。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. 國際資料傳輸</h2>
            <p className="text-gray-700 leading-relaxed">
              您的資料可能被傳輸至並儲存在您所在國家/地區以外的伺服器。
              我們將確保採取適當的安全措施保護您的資料。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. 政策更新</h2>
            <p className="text-gray-700 leading-relaxed">
              我們可能不時更新本隱私政策。重大變更將通過Email或平台通知告知您。
              繼續使用本平台即表示您接受更新後的隱私政策。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. 聯繫我們</h2>
            <div className="text-gray-700 leading-relaxed">
              <p>如您對本隱私政策有任何疑問或需要行使您的權利，請聯繫我們：</p>
              <div className="mt-3 ml-4">
                <p><strong>Email:</strong> privacy@bookclub.com</p>
                <p><strong>客服支援:</strong> support@bookclub.com</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/register" className="text-blue-600 hover:underline">
            ← 返回註冊頁面
          </Link>
        </div>
      </div>
    </div>
  );
}
