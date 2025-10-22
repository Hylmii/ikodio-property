import Link from 'next/link';

export function TenantRegisterLinks() {
  return (
    <div className="mt-6 text-center text-sm">
      <p className="text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/login-tenant" className="text-primary hover:underline font-medium">
          Login di sini
        </Link>
      </p>
      <p className="mt-2 text-muted-foreground">
        Daftar sebagai user?{' '}
        <Link href="/register-user" className="text-primary hover:underline font-medium">
          Klik di sini
        </Link>
      </p>
    </div>
  );
}
