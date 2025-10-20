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
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">IkodioProperty</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="font-medium"
                >
                  Home
                </Button>
              </Link>
              <Link href="/properties">
                <Button 
                  variant={isActive('/properties') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="font-medium"
                >
                  Properties
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {status === 'loading' ? (
              <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            ) : session?.user ? (
              <>
                {session.user.role === 'TENANT' && (
                  <>
                    <Link href="/tenant/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/tenant/properties">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Properti
                      </Button>
                    </Link>
                    <Link href="/tenant/orders">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pesanan
                      </Button>
                    </Link>
                  </>
                )}
                {session.user.role === 'USER' && (
                  <>
                    <Link href="/transactions">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Transaksi
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login-user">
                  <Button variant="ghost" size="sm">
                    Login User
                  </Button>
                </Link>
                <Link href="/login-tenant">
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30" size="sm">
                    Login Tenant
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
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
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className={`text-sm font-medium ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/properties"
              className={`text-sm font-medium ${
                isActive('/properties') ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Properties
            </Link>

            <div className="border-t pt-4 flex flex-col gap-2">
              {session?.user ? (
                <>
                  {session.user.role === 'TENANT' && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {session.user.role === 'USER' && (
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
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
                    <Button variant="ghost" size="sm" className="w-full">
                      Login as User
                    </Button>
                  </Link>
                  <Link href="/login-tenant" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
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
