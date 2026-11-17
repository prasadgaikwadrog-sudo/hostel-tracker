import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useAdminListComplaints, getAdminListComplaintsQueryKey } from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { Search, FileText } from "lucide-react";

export default function AdminComplaintsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const params: any = {};
  if (statusFilter) params.status = statusFilter;
  if (priorityFilter) params.priority = priorityFilter;
  if (debouncedSearch) params.search = debouncedSearch;

  const { data, isLoading } = useAdminListComplaints(
    Object.keys(params).length > 0 ? params : undefined,
    { query: { queryKey: getAdminListComplaintsQueryKey(Object.keys(params).length > 0 ? params : undefined) } }
  );
  const complaints = data?.complaints || [];

  return (
    <AuthGuard adminOnly>
      <AppLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">All Complaints</h1>
              <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} total</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search complaints..."
                data-testid="search-input"
                className="w-full pl-9 pr-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="status-filter"
              className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              data-testid="priority-filter"
              className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Title</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Room</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <FileText size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No complaints found</p>
                    </td>
                  </tr>
                ) : complaints.map((c) => (
                  <Link key={c.id} href={`/admin/complaints/${c.id}`}>
                    <tr
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                      data-testid={`admin-complaint-row-${c.id}`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground truncate max-w-[200px]">{c.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{(c as any).user?.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.category}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.roomNumber}</td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={c.priority as any} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status as any} /></td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
