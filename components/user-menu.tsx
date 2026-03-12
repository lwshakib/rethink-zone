"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, User, LayoutGrid } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) return null;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full border border-border/50 hover:bg-accent/50 transition-colors"
        >
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || "User"}
            />
            <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
              {session.user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-card/80 border-border/50 text-foreground backdrop-blur-xl"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">
              {session.user.name}
            </p>
            <p className="text-[11px] leading-none text-muted-foreground truncate">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-2.5 text-xs focus:bg-accent focus:text-accent-foreground"
          onClick={() => router.push("/workspaces")}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Workspaces
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-2.5 text-xs focus:bg-accent focus:text-accent-foreground"
          onClick={() => router.push("/account")}
        >
          <Settings className="h-3.5 w-3.5" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-2.5 text-xs text-primary focus:bg-destructive/10 focus:text-primary"
          onClick={handleSignOut}
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
