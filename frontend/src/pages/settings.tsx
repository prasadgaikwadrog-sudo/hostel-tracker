import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <AppLayout>
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>
          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-sm text-foreground mb-4">Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{user?.name || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium text-foreground capitalize">{user?.role?.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
