import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useGetWeeklyReport, getGetWeeklyReportQueryKey } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PriorityBadge } from "@/components/ui/status-badge";

export default function WeeklyReportPage() {
  const { data, isLoading } = useGetWeeklyReport({
    query: { queryKey: getGetWeeklyReportQueryKey() }
  });

  return (
    <AuthGuard adminOnly>
      <AppLayout>
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Weekly Report</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {data ? `${new Date(data.weekStart).toLocaleDateString()} — ${new Date(data.weekEnd).toLocaleDateString()}` : "Last 7 days"}
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                  <p className="text-3xl font-bold text-foreground">{data?.totalSubmitted ?? 0}</p>
                </div>
                <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{data?.totalResolved ?? 0}</p>
                </div>
                <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Avg Resolution</p>
                  <p className="text-3xl font-bold text-blue-600">{data?.avgResolutionHours ?? 0}h</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-sm text-foreground mb-4">Complaints by Day</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data?.byDay || []}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en", { weekday: "short" })} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(d) => new Date(d).toLocaleDateString()}
                        formatter={(v) => [v, "Complaints"]}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {(data?.byDay || []).map((_, i) => (
                          <Cell key={i} fill="hsl(213 60% 28%)" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-sm text-foreground mb-4">By Category</h2>
                  <div className="space-y-3">
                    {(data?.byCategory || []).map((cat) => (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground">{cat.category}</span>
                          <span className="text-muted-foreground text-xs">{cat.resolved}/{cat.count} resolved</span>
                        </div>
                        <div className="bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary rounded-full h-1.5 transition-all"
                            style={{ width: cat.count > 0 ? `${(cat.resolved / cat.count) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                    ))}
                    {(!data?.byCategory || data.byCategory.length === 0) && (
                      <p className="text-muted-foreground text-sm text-center py-4">No data for this week</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-semibold text-sm text-foreground">Top Issues This Week</h2>
                </div>
                {(data?.topIssues || []).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No high-priority issues this week</div>
                ) : (
                  <div className="divide-y divide-border">
                    {(data?.topIssues || []).map((issue, i) => (
                      <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">{issue.category}</p>
                        </div>
                        <PriorityBadge priority={issue.priority as any} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
