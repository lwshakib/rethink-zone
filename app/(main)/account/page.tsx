"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ChevronLeft,
  User,
  Lock,
  ShieldCheck,
  Smartphone,
  Globe,
  LogOut,
  X,
  Loader2,
  Mail,
  Key,
  Camera,
} from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface Session {
  id: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface Account {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [name, setName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, accountsRes] = await Promise.all([
        authClient.listSessions(),
        authClient.listAccounts(),
      ]);

      if (sessionsRes.data)
        setSessions(sessionsRes.data as unknown as Session[]);
      if (accountsRes.data)
        setAccounts(accountsRes.data as unknown as Account[]);
    } catch (error) {
      console.error("Failed to fetch account data:", error);
      toast.error("Failed to load account settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetchData();
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setUpdatingProfile(true);
      const { error } = await authClient.updateUser({
        name: name,
      });

      if (error) throw error;
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const uploadFileToCloudinary = async (file: File, signal?: AbortSignal) => {
    const sigRes = await fetch("/api/cloudinary-signature");
    if (!sigRes.ok) {
      throw new Error("Failed to get upload signature");
    }
    const signature = await sigRes.json();
    const uploadApi = `https://api.cloudinary.com/v1_1/${signature.cloudName}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder ?? "rethink-zone");

    const uploadRes = await fetch(uploadApi, {
      method: "POST",
      body: formData,
      signal,
    });

    if (!uploadRes.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await uploadRes.json();
    return {
      secureUrl: data.secure_url as string,
      publicId: data.public_id as string,
      resourceType: data.resource_type as string,
    };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const { secureUrl } = await uploadFileToCloudinary(file);

      const { error } = await authClient.updateUser({
        image: secureUrl,
      });

      if (error) throw error;
      toast.success("Profile picture updated");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword: oldPassword,
        revokeOtherSessions: false,
      });

      if (error) throw error;

      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (token: string) => {
    try {
      const { error } = await authClient.revokeSession({
        token: token,
      });

      if (error) throw error;
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  if (sessionPending || (loading && !session)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }


  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/workspaces"
              className="flex size-8 items-center justify-center rounded-full bg-accent transition-colors hover:bg-accent/80"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold tracking-tight">
              Account Settings
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Profile Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Public Profile
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage how others see you on Rethink.
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-8">
              {/* Profile Image Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-border/50 shadow-md">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                      {session.user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center sm:items-start gap-2">
                  <h3 className="text-sm font-semibold">Profile Picture</h3>
                  <p className="text-[11px] text-muted-foreground max-w-[200px] text-center sm:text-left">
                    We recommend an image of at least 400x400. PNG or JPG only.
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 rounded-full border-border/50 text-xs font-bold gap-2 hover:bg-accent/50 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <span>
                        <Camera className="h-3.5 w-3.5" />
                        {uploadingImage ? "Uploading..." : "Change Image"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <Separator className="bg-border/30" />

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Display Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="bg-accent/5 transition-all focus:bg-accent/10 border-border/50 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Email Address
                    </label>
                    <div className="flex items-center h-10 px-3 rounded-md bg-accent/20 border border-border/30 text-sm text-muted-foreground cursor-not-allowed">
                      <Mail className="h-3.5 w-3.5 mr-2 opacity-50" />
                      {session.user.email}
                      <Badge
                        variant="outline"
                        className="ml-auto text-[9px] h-4 bg-primary/10 text-primary border-primary/20"
                      >
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingProfile || name === session.user.name}
                    className="h-9 px-6 text-xs font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-40"
                  >
                    {updatingProfile && (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Security / Password */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Security
            </h2>
            <p className="text-xs text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-accent/5 transition-all focus:bg-accent/10 border-border/50 h-10"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-accent/5 transition-all focus:bg-accent/10 border-border/50 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-accent/5 transition-all focus:bg-accent/10 border-border/50 h-10"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={changingPassword || !oldPassword || !newPassword}
                    className="h-9 px-6 text-xs font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-40"
                  >
                    {changingPassword && (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Sessions Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Active Sessions
            </h2>
            <p className="text-xs text-muted-foreground">
              Devices currently logged into your Rethink account.
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {sessions.length === 0 ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    Loading sessions...
                  </div>
                ) : (
                  sessions.map((s) => {
                    // Better Auth usually marks active session
                    // As per requirement: Current session there should not be any revoke session button.
                    // We need a reliable way to identify current session.
                    // Better auth `listSessions` returns data where the current session often has a flag or we can match token if available.

                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-accent/30 flex items-center justify-center border border-border/20">
                            {s.userAgent?.toLowerCase().includes("mobile") ? (
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">
                                {s.userAgent?.split(")")[0]?.split("(")[1] ||
                                  "Unknown Browser"}
                              </span>
                              {s.id === session.session.id && (
                                <Badge className="text-[8px] h-3.5 bg-primary/10 text-primary border-primary/20 px-1 py-0 shadow-none font-bold">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>{s.ipAddress || "0.0.0.0"}</span>
                              <span>•</span>
                              <span>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {s.id !== session.session.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeSession(s.token)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 size-8 rounded-full"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Connected Accounts Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              Connected Accounts
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage third-party login providers.
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {/* Google */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-background border border-border/40 flex items-center justify-center p-2">
                      <Image
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        width={24}
                        height={24}
                        className="size-full opacity-80"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Google</div>
                      <div className="text-[10px] text-muted-foreground">
                        Fast login via Google OAuth
                      </div>
                    </div>
                  </div>
                  <div>
                    {accounts.find((a) => a.providerId === "google") ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 py-0 font-bold">
                        Connected
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] rounded-full border-border/50 hover:bg-accent/50"
                        onClick={() => {
                          authClient.signIn.social({ provider: "google" });
                        }}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Microsoft */}
                <div className="flex items-center justify-between p-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-background border border-border/40 flex items-center justify-center p-2">
                      <Image
                        src="https://www.microsoft.com/favicon.ico"
                        alt="Microsoft"
                        width={24}
                        height={24}
                        className="size-full opacity-80 grayscale"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        Microsoft
                      </div>
                      <div className="text-[10px] text-muted-foreground italic">
                        Unavailable
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-2 py-0">
                    Soon
                  </Badge>
                </div>

                {/* Email/Password */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-background border border-border/40 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">
                        Email & Password
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Standard credentials
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 py-0">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sign Out Action */}
        <div className="pt-6">
          <Button
            variant="ghost"
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.push("/sign-in"),
                },
              });
            }}
            className="w-full h-12 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20 border-dashed"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out from all devices
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-border/30">
        <p className="text-[10px] text-muted-foreground">
          © 2026 Rethink. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
