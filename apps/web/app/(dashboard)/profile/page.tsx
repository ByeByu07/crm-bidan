"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "sonner";
import { LogOut, User, Building2, Mail } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<Awaited<ReturnType<typeof authClient.getSession>>["data"]>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ clinic_name: "", location: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setSession(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          clinic_name: data.clinic_name ?? "",
          location: data.location ?? "",
        });
      })
      .catch(() => {
        // ignore
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Profil diperbarui");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await authClient.signOut();
    router.push("/signin");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Profil</h1>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar size="lg">
            <AvatarFallback className="text-lg">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{session?.user.name}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="size-3" />
              <span>{session?.user.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="size-4" />
            Informasi Klinik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinic_name">Nama Klinik</Label>
              <Input
                id="clinic_name"
                placeholder="Nama klinik"
                value={profile.clinic_name}
                onChange={(e) => setProfile({ ...profile, clinic_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                placeholder="Alamat klinik"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="mr-2 size-4" />
        Keluar
      </Button>
    </div>
  );
}
