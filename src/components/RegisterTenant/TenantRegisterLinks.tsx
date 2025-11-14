import Link from 'next/link';

export function TenantRegisterLinks() {
  return (
    <div className="mt-6 text-center text-sm space-y-2">
      <p className="text-white/90">
        Sudah punya akun?{' '}
        <Link href="/login-tenant" className="text-white hover:underline font-bold">
          Login di sini
        </Link>
      </p>
      <p className="text-white/90">
        Daftar sebagai user?{' '}
        <Link href="/register-user" className="text-white hover:underline font-bold">
          Klik di sini
        </Link>
      </p>
    </div>
  );
}
