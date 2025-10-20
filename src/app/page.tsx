import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield, Clock, Star, Search, MapPin, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
        
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm font-medium">Dipercaya oleh 10,000+ pengguna</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
              Temukan Tempat
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mt-2">
                Menginap Impian
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-slate-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Booking properti dengan mudah, aman, dan terpercaya. Pengalaman menginap terbaik menanti Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 h-14 px-8 text-lg font-semibold transition-all hover:scale-105" asChild>
                <Link href="/properties">
                  <Search className="mr-2 h-5 w-5" />
                  Jelajahi Properti
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm h-14 px-8 text-lg font-semibold transition-all hover:scale-105" asChild>
                <Link href="/register-tenant">
                  <Building2 className="mr-2 h-5 w-5" />
                  Daftar Sebagai Penyedia
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
      </section>

      <section className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Platform terpercaya untuk menemukan dan booking properti impian Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Beragam Pilihan</CardTitle>
                <CardDescription className="text-base">
                  Ribuan properti tersedia di berbagai lokasi strategis untuk kebutuhan Anda
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-slate-100 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Aman & Terpercaya</CardTitle>
                <CardDescription className="text-base">
                  Sistem verifikasi ketat dan pembayaran aman untuk melindungi transaksi Anda
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-slate-100 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Booking Mudah</CardTitle>
                <CardDescription className="text-base">
                  Proses booking online yang cepat dan praktis, tersedia 24/7 untuk Anda
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-slate-100 dark:border-slate-800 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Review Terpercaya</CardTitle>
                <CardDescription className="text-base">
                  Ulasan asli dari pengguna terverifikasi untuk membantu keputusan Anda
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Cara Kerja
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Tiga langkah mudah untuk menemukan tempat menginap impian Anda
              </p>
            </div>

            <div className="grid gap-8">
              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Cari Properti</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Gunakan fitur pencarian kami untuk menemukan properti yang sesuai dengan kebutuhan dan budget Anda. Filter berdasarkan lokasi, harga, dan fasilitas.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Booking & Bayar</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Pilih tanggal check-in dan check-out, kemudian lakukan booking. Bayar dengan metode yang tersedia dan upload bukti pembayaran Anda.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Nikmati Pengalaman</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Setelah pembayaran dikonfirmasi, Anda siap untuk check-in. Nikmati pengalaman menginap dan berikan review untuk membantu pengguna lain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Siap Memulai Petualangan Anda?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Bergabunglah dengan ribuan pengguna yang telah menemukan tempat menginap impian mereka
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 text-lg font-semibold shadow-xl transition-all hover:scale-105" asChild>
              <Link href="/properties">
                Mulai Sekarang
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
