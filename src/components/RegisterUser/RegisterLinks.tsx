import Link from 'next/link';

export function RegisterLinks() {
  return (
    <div className="mt-6 text-center text-sm">
      <p className="text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/login-user" className="text-primary hover:underline font-medium">
          Login di sini
        </Link>
      </p>
      <p className="mt-2 text-muted-foreground">
        Daftar sebagai tenant?{' '}
        <Link href="/register-tenant" className="text-primary hover:underline font-medium">
          Klik di sini
        </Link>
      </p>
    </div>
  );
}
