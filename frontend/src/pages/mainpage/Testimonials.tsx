export default function Testimonials() {
  const testimonials = [
    {
      name: "王小明",
      role: "資深書友",
      avatar: "WM",
      content: "BookClub 讓我找到了許多志同道合的朋友,每次討論都能獲得新的啟發。強烈推薦給所有愛書人!"
    },
    {
      name: "李美玲",
      role: "讀書會會長",
      avatar: "LM",
      content: "管理讀書會變得前所未有的簡單,成員們都很喜歡這個平台的設計和功能。"
    },
    {
      name: "張大偉",
      role: "職場新鮮人",
      avatar: "ZD",
      content: "透過 BookClub 養成了持續閱讀的習慣,進度追蹤功能讓我更有動力完成每一本書。"
    }
  ];

  return (
    <section id="testimonials" className="py-20 sm:py-24 bg-gradient-to-br from-brand-light/10 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            書友們的
            <span className="bg-gradient-to-r from-brand-primary to-blue-500 bg-clip-text text-transparent">
              {" "}真實評價
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            看看其他書友怎麼說
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex mt-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
