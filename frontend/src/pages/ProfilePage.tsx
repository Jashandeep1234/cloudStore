import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { Mail, LogOut, Loader2, ShieldCheck, UserRound } from "lucide-react";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";

export const ProfilePage = () => {
  const storedUser = useAuthStore((s) => s.user);
  const { data: freshUser, isLoading } = useCurrentUser();
  const { mutate: handleLogout, isPending: isLoggingOut } = useLogout();

  const user = freshUser ?? storedUser;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">User Profile</h1>
        <p className="text-muted-foreground">
          View your account details and sign out.
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-5">
          <Avatar className="h-20 w-20">
            {user?.picture && <AvatarImage src={user.picture} alt={user.name} />}
            <AvatarFallback className="text-2xl font-semibold bg-blue-100 text-blue-700">
              {user ? getInitials(user.name) : <UserRound className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl truncate">
              {isLoading ? "Loading…" : user?.name ?? "User"}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {user?.email ?? "—"}
            </CardDescription>
            {user?.roles?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.roles.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="gap-1 capitalize"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {role.replace("ROLE_", "")}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="border-t pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User ID
              </p>
              <p className="text-sm font-semibold mt-1 font-mono">
                {user?.id ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-semibold mt-1 break-all">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sign out</CardTitle>
          <CardDescription>
            Sign out of your CloudStore account on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={() => handleLogout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isLoggingOut ? "Signing out…" : "Log out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
