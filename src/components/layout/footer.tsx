import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">IkodioProperty</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform penyewaan properti terpercaya dengan sistem booking online yang mudah dan aman untuk pengalaman menginap terbaik.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="h-9 w-9 rounded-lg bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors hover:pl-2 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-blue-400 transition-colors hover:pl-2 inline-block">
                  Cari Properti
                </Link>
              </li>
              <li>
                <Link href="/login-user" className="hover:text-blue-400 transition-colors hover:pl-2 inline-block">
                  Login User
                </Link>
              </li>
              <li>
                <Link href="/register-user" className="hover:text-blue-400 transition-colors hover:pl-2 inline-block">
                  Register User
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-lg">Untuk Penyedia</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/login-tenant" className="hover:text-blue-400 transition-colors hover:pl-2 inline-block">
                  Login Tenant
                </Link>
              </li>
              <li>
                <Link href="/register-tenant" className="hover:text-blue-400 transition-colors hover:pl-2 inline-block">
                  Daftar Sebagai Penyedia
                </Link>
              </li>
              <li>
                <Link href="/tenant/dashboard" className="hover:text-blue-400 transition-colors hover:pl-2 inline-block">
                  Dashboard Tenant
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-lg">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>support@ikodioproperty.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>&copy; {currentYear} IkodioProperty. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
