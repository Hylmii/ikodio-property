import { XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerificationErrorProps {
  message?: string;
}

export function VerificationError({ message }: VerificationErrorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <CardTitle className="text-center">Verifikasi Gagal</CardTitle>
        <CardDescription className="text-center">
          {message || 'Link verifikasi tidak valid atau telah kadaluarsa. Silakan minta link verifikasi baru.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/resend-verification" className="w-full">
          <Button className="w-full">Kirim Ulang Email Verifikasi</Button>
        </Link>
        <Link href="/register-user" className="w-full">
          <Button variant="outline" className="w-full">Daftar Ulang</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
