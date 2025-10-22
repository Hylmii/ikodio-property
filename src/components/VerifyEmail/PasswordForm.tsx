import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";

interface PasswordFormProps {
  email: string;
  password: string;
  confirmPassword: string;
  isSubmitting: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function PasswordForm({
  email,
  password,
  confirmPassword,
  isSubmitting,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: PasswordFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verifikasi Email</CardTitle>
        <CardDescription>
          Silakan buat password untuk email: <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={isSubmitting}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Ulangi password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            disabled={isSubmitting}
            required
            minLength={8}
          />
        </div>
        <Button onClick={onSubmit} className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Memverifikasi...' : 'Verifikasi Email'}
        </Button>
      </CardContent>
    </Card>
  );
}
