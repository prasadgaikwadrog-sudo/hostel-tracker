import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { CheckCircle, Clock, AlertTriangle, BarChart2, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminDashboard({
    query: { queryKey: getGetAdminDashboardQueryKey() }
  });

  return (
    <AuthGuard adminOnly>
      <AppLayout>
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Overview of hostel complaints</p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                  { label: "Total", value: data?.totalComplaints, color: "bg-blue-50", textColor: "text-blue-700", icon: <BarChart2 size={16} className="text-blue-500" /> },
                  { label: "Pending", value: data?.pendingComplaints, color: "bg-amber-50", textColor: "text-amber-700", icon: <Clock size={16} className="text-amber-500" /> },
                  { label: "In Progress", value: data?.inProgressComplaints, color: "bg-blue-50", textColor: "text-blue-700", icon: <TrendingUp size={16} className="text-blue-500" /> },
                  { label: "Resolved", value: data?.resolvedComplaints, color: "bg-green-50", textColor: "text-green-700", icon: <CheckCircle size={16} className="text-green-500" /> },
                  { label: "Urgent", value: data?.urgentComplaints, color: "bg-red-50", textColor: "text-red-700", icon: <AlertTriangle size={16} className="text-red-500" /> },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.color} rounded-xl p-4 border border-transparent`} data-testid={`admin-stat-${stat.label.toLowerCase()}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {stat.icon}
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value ?? 0}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm text-foreground">Recent Complaints</h2>
                    <Link href="/admin/complaints">
                      <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
                    </Link>
                  </div>
                  <div className="divide-y divide-border">
                    {(data?.recentComplaints || []).map((c) => (
                      <Link key={c.id} href={`/admin/complaints/${c.id}`}>
                        <div className="px-5 py-3.5 hover:bg-muted/20 cursor-pointer" data-testid={`admin-complaint-${c.id}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
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
                    {(!data?.recentComplaints || data.recentComplaints.length === 0) && (
                      <div className="p-8 text-center text-muted-foreground text-sm">No complaints yet</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-sm text-foreground mb-4">By Category</h3>
                    <div className="space-y-2.5">
                      {(data?.byCategory || []).slice(0, 6).map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{cat.category}</span>
                          <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-sm text-foreground mb-3">Resolution Rate</h3>
                    <p className="text-3xl font-bold text-primary">{data?.resolutionRate ?? 0}%</p>
                    <div className="mt-2 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${data?.resolutionRate ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
