import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useListComplaints, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { PlusCircle, FileText } from "lucide-react";

export default function ComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useListComplaints(
    statusFilter ? { status: statusFilter as any } : undefined,
    { query: { queryKey: getListComplaintsQueryKey(statusFilter ? { status: statusFilter as any } : undefined) } }
  );
  const complaints = data?.complaints || [];

  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
            <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} total complaints</p>
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

        <div className="flex gap-2 mb-4">
          {["", "PENDING", "IN_PROGRESS", "RESOLVED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              data-testid={`filter-${s || "all"}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {s === "" ? "All" : s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No complaints found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {complaints.map((c) => (
                <Link key={c.id} href={`/complaints/${c.id}`}>
                  <div data-testid={`complaint-${c.id}`} className="px-6 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Room {c.roomNumber} &bull; {c.category} &bull; {new Date(c.createdAt).toLocaleDateString()}</p>
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
      </AppLayout>
    </AuthGuard>
  );
}
