import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = [
    { label: '關於我們', path: '/about' },
    { label: '服務條款', path: '/terms' },
    { label: '隱私政策', path: '/privacy' },
    { label: '聯絡我們', path: '/contact' },
  ]

  const socialLinks = [
    { label: 'Facebook', url: 'https://facebook.com' },
    { label: 'Instagram', url: 'https://instagram.com' },
    { label: 'Twitter', url: 'https://twitter.com' },
  ]

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-8">
          {/* Navigation Links */}
          <nav className="flex flex-wrap gap-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">
              © {currentYear} 讀書會平台. All rights reserved.
            </p>
          </div>

          {/* Social Media */}
          <div className="flex items-center justify-end gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col space-y-4 md:hidden">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Media */}
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {social.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {currentYear} 讀書會平台. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
