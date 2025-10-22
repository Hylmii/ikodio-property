import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function VerificationSuccess() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-center">Email Terverifikasi!</CardTitle>
        <CardDescription className="text-center">
          Email Anda berhasil diverifikasi. Anda sekarang dapat login ke akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login-user" className="w-full">
          <Button className="w-full">Login Sekarang</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
