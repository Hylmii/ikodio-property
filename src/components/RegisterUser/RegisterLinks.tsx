import Link from 'next/link';

export function RegisterLinks() {
  return (
    <div className="mt-6 text-center text-sm space-y-2">
      <p className="text-white/90">
        Sudah punya akun?{' '}
        <Link href="/login-user" className="text-white hover:underline font-bold">
          Login di sini
        </Link>
      </p>
      <p className="text-white/90">
        Daftar sebagai tenant?{' '}
        <Link href="/register-tenant" className="text-white hover:underline font-bold">
          Klik di sini
        </Link>
      </p>
    </div>
  );
}
