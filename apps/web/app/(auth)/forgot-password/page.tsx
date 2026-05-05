"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await (authClient as any).forgetPassword({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      setError(error.message ?? "Gagal mengirim email reset password.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Periksa email Anda</CardTitle>
          <CardDescription>
            Link reset password telah dikirim
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Jika email terdaftar, kami telah mengirimkan link reset password.
          </p>
        </CardContent>
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

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Lupa password?</CardTitle>
        <CardDescription>
          Masukkan email Anda untuk reset password
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Link Reset"}
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
