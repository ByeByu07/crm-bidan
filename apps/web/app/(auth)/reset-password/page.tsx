"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import { Lock, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak valid atau sudah kadaluarsa.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: password,
    });

    if (error) {
      setError(error.message ?? "Gagal reset password. Token mungkin sudah kadaluarsa.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Berhasil!</CardTitle>
          <CardDescription>
            Password Anda telah diubah
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Password berhasil diubah. Silakan masuk dengan password baru.
          </p>
          <Link href="/signin">
            <Button className="w-full">
              Masuk
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Buat password baru</CardTitle>
        <CardDescription>
          Masukkan password baru Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10 pr-10"
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading || !token}>
            {loading ? "Memproses..." : "Reset Password"}
          </Button>
        </CardContent>
      </form>

      <CardFooter className="flex items-center justify-center text-sm text-muted-foreground">
        <Link
          href="/signin"
          className="text-foreground hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="text-center text-sm text-muted-foreground py-8">
            Memuat...
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
