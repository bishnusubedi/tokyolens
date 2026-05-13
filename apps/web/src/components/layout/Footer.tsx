import Link from 'next/link'
import { Camera } from 'lucide-react'

const columns = [
  {
    heading: 'Explore',
    links: [
      { label: 'Gallery', href: '/' },
      { label: 'Forum', href: '/forum' },
      { label: 'Collections', href: '/collections' },
      { label: 'Photographers', href: '/users' },
      { label: 'Awards', href: '/awards' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Upload a Photo', href: '/upload' },
      { label: 'Sign up', href: '/register' },
      { label: 'Log in', href: '/login' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Contact Us', href: 'mailto:hello@tokyolens.jp' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[#dadad3] bg-white mt-16">
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-bold text-black uppercase tracking-wider mb-3">{col.heading}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#62625b] hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[#dadad3] flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2 text-[#e60023] font-bold">
            <Camera className="h-4 w-4" />
            TokyoLens
          </Link>
          <p className="text-xs text-[#62625b]">&copy; 2026 TokyoLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
