import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <section id="newsletter" className="py-20 sm:py-24 bg-gradient-to-br from-brand-primary to-blue-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            訂閱 BookClub 電子報
          </h2>
          <p className="text-lg text-white/90 mb-8">
            獲取最新閱讀資訊、精選書單推薦,以及專屬優惠活動通知
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="輸入您的電子郵件"
                required
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-[#04c0f4] rounded-lg hover:bg-gray-100 font-semibold transition-colors whitespace-nowrap"
              >
                立即訂閱
              </button>
            </form>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <svg className="w-12 h-12 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-lg font-semibold">訂閱成功!</p>
              <p className="text-white/90 mt-2">感謝您的訂閱,我們會定期將精彩內容送到您的信箱</p>
            </div>
          )}

          <p className="text-sm text-white/70 mt-6">
            我們重視您的隱私,不會將您的資料分享給第三方
          </p>
        </div>
      </div>
    </section>
  );
}
