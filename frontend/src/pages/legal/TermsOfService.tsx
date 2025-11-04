import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link to="/register" className="text-blue-600 hover:underline text-sm">
            ← 返回註冊頁面
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">服務條款</h1>
        <p className="text-sm text-gray-600 mb-8">最後更新日期：2025年11月4日</p>

        <div className="prose prose-blue max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. 服務簡介</h2>
            <p className="text-gray-700 leading-relaxed">
              歡迎使用線上讀書會平台（以下簡稱「本平台」）。本平台致力於為用戶提供線上讀書會的組織、管理和參與服務。
              使用本平台服務前，請仔細閱讀並同意本服務條款。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. 帳號註冊</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>當您註冊本平台帳號時，您同意：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>提供真實、準確、完整的個人資料</li>
                <li>妥善保管您的帳號密碼，不與他人共用</li>
                <li>對您帳號下的所有活動負責</li>
                <li>若發現帳號遭未經授權使用，立即通知本平台</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. 使用規範</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>使用本平台時，您不得：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>發布違法、侵權、誹謗、騷擾或不當內容</li>
                <li>冒用他人身份或誤導性陳述</li>
                <li>干擾或破壞本平台的正常運作</li>
                <li>未經授權存取其他用戶的帳號或資料</li>
                <li>進行商業廣告或垃圾訊息傳播</li>
                <li>侵犯他人的智慧財產權</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. 內容權利</h2>
            <p className="text-gray-700 leading-relaxed">
              您在本平台上發布的內容（包括但不限於文字、圖片、評論等），您保留其所有權。
              但您授予本平台非專屬、免費、全球性的使用權，以便本平台提供和改進服務。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. 隱私保護</h2>
            <p className="text-gray-700 leading-relaxed">
              本平台重視您的隱私。我們如何收集、使用和保護您的個人資料，請參閱我們的
              <Link to="/privacy" className="text-blue-600 hover:underline mx-1">
                隱私政策
              </Link>
              。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. 服務變更與終止</h2>
            <p className="text-gray-700 leading-relaxed">
              本平台保留隨時修改、暫停或終止部分或全部服務的權利。
              對於違反本條款的用戶，本平台有權暫停或終止其帳號。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. 免責聲明</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>本平台按「現狀」提供服務，不提供任何明示或暗示的保證，包括但不限於：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>服務的適用性、可靠性或準確性</li>
                <li>服務不會中斷或無錯誤</li>
                <li>使用服務所獲得的結果</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. 責任限制</h2>
            <p className="text-gray-700 leading-relaxed">
              在法律允許的最大範圍內，本平台對於任何間接、偶然、特殊或後果性損害不承擔責任。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. 條款修改</h2>
            <p className="text-gray-700 leading-relaxed">
              本平台保留隨時修改本服務條款的權利。修改後的條款將在本頁面公布，
              繼續使用本平台服務即表示您接受修改後的條款。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. 聯繫我們</h2>
            <p className="text-gray-700 leading-relaxed">
              如您對本服務條款有任何疑問，請聯繫我們：
              <br />
              Email: support@bookclub.com
            </p>
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
