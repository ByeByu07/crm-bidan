"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff, Lock, Mail, User, Building2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    const signUpPayload: Record<string, any> = {
      email,
      password,
      name,
      callbackURL: "/sales",
      clinic_name: clinicName,
    };
    const { error } = await (authClient.signUp.email as any)(signUpPayload);

    if (error) {
      setError(error.message ?? "Gagal mendaftar. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    try {
      await (authClient.organization.update as any)({
        name: clinicName,
      });
    } catch {
      // Organization update is best-effort; user can update later
    }

    router.push("/sales");
    router.refresh();
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Buat akun</CardTitle>
        <CardDescription>
          Daftar untuk memulai dengan BidanCRM
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Dr. Siti Aminah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clinic_name">Nama Klinik</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="clinic_name"
                placeholder="Klinik Bidan Sehat"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

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

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirm_password">Konfirmasi Password</Label>
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

          {/*
          <div className="flex items-center gap-2">
            <Checkbox
              id="agree"
            />
            <Label htmlFor="agree" className="text-sm">
              Saya setuju dengan syarat dan ketentuan
            </Label>
          </div>
          */}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>

          {/*
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              atau
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button type="button" variant="outline">
              <Chrome className="h-4 w-4 mr-2" />
              Google
            </Button>
          </div>
          */}
        </CardContent>
      </form>

      <CardFooter className="flex items-center justify-center text-sm text-muted-foreground">
        Sudah punya akun?
        <Link
          href="/signin"
          className="ml-1 text-foreground hover:underline"
        >
          Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}
