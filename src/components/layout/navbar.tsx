'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Menu, X, User, LogOut, LayoutDashboard, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <span className="text-2xl font-bold text-black tracking-tight group-hover:scale-105 transition-transform">Ikodio</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`font-medium text-gray-700 ${isActive('/') ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                >
                  Home
                </Button>
              </Link>
              <Link href="/properties">
                <Button 
                  variant={isActive('/properties') ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`font-medium text-gray-700 ${isActive('/properties') ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                >
                  Properties
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {status === 'loading' ? (
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
            ) : session?.user ? (
              <>
                {session.user.role === 'TENANT' && (
                  <>
                    <Link href="/tenant/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:bg-gray-100">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/tenant/properties">
                      <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:bg-gray-100">
                        <Building2 className="h-4 w-4" />
                        Properti
                      </Button>
                    </Link>
                    <Link href="/tenant/orders">
                      <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:bg-gray-100">
                        <CreditCard className="h-4 w-4" />
                        Pesanan
                      </Button>
                    </Link>
                  </>
                )}
                {session.user.role === 'USER' && (
                  <>
                    <Link href="/transactions">
                      <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:bg-gray-100">
                        <CreditCard className="h-4 w-4" />
                        Transaksi
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:bg-gray-100">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login-user">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                    Login User
                  </Button>
                </Link>
                <Link href="/login-tenant">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm">
                    Login Tenant
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className={`text-sm font-medium ${
                isActive('/') ? 'text-gray-900' : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/properties"
              className={`text-sm font-medium ${
                isActive('/properties') ? 'text-gray-900' : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Properties
            </Link>

            <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">
              {session?.user ? (
                <>
                  {session.user.role === 'TENANT' && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {session.user.role === 'USER' && (
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login-user" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full text-gray-700 hover:bg-gray-100">
                      Login as User
                    </Button>
                  </Link>
                  <Link href="/login-tenant" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" size="sm">
                      Login as Tenant
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
