import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useListComplaints, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { PlusCircle, FileText, Clock, CheckCircle } from "lucide-react";

function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useListComplaints(undefined, {
    query: { queryKey: getListComplaintsQueryKey() }
  });

  const complaints = data?.complaints || [];
  const pending = complaints.filter((c) => c.status === "PENDING").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name || "Student"}</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage your hostel complaints</p>
        </div>
        <Link href="/complaints/new">
          <button
            data-testid="new-complaint-button"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <PlusCircle size={16} />
            New Complaint
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div data-testid="stat-pending" className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div data-testid="stat-in-progress" className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div data-testid="stat-resolved" className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolved}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Recent Complaints</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No complaints yet.</p>
            <Link href="/complaints/new">
              <button className="mt-3 text-sm text-primary hover:underline">Submit your first complaint</button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {complaints.slice(0, 10).map((c) => (
              <Link key={c.id} href={`/complaints/${c.id}`}>
                <div data-testid={`complaint-row-${c.id}`} className="px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Room {c.roomNumber} &bull; {c.category}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={c.priority as any} />
                      <StatusBadge status={c.status as any} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <StudentDashboard />
      </AppLayout>
    </AuthGuard>
  );
}
