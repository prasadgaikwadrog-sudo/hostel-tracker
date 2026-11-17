import { useState } from "react";
import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import {
  useGetComplaint,
  useUpdateComplaint,
  useAddComment,
  getGetComplaintQueryKey,
  getAdminListComplaintsQueryKey,
} from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, AlertCircle, Send } from "lucide-react";

function AdminComplaintDetail({ id }: { id: string }) {
  const { data: complaint, isLoading } = useGetComplaint(id, {
    query: { queryKey: getGetComplaintQueryKey(id) }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [comment, setComment] = useState("");

  const updateComplaint = useUpdateComplaint();
  const addComment = useAddComment();

  const handleUpdate = () => {
    const body: any = {};
    if (newStatus) body.status = newStatus;
    if (newPriority) body.priority = newPriority;
    if (Object.keys(body).length === 0) return;

    updateComplaint.mutate(
      { id, data: body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetComplaintQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getAdminListComplaintsQueryKey() });
          toast({ title: "Updated!", description: "Complaint has been updated." });
          setNewStatus("");
          setNewPriority("");
        },
        onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
      }
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addComment.mutate(
      { id, data: { message: comment } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetComplaintQueryKey(id) });
          toast({ title: "Remark added!" });
          setComment("");
        },
        onError: () => toast({ title: "Error", description: "Failed to add remark", variant: "destructive" }),
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>;
  if (!complaint) return <div className="p-8 text-center text-muted-foreground text-sm">Complaint not found</div>;

  const comments = (complaint as any).comments || [];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-5">
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-foreground">{complaint.title}</h1>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={complaint.priority as any} />
              <StatusBadge status={complaint.status as any} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-muted-foreground">Category:</span><span className="ml-2 font-medium">{complaint.category}</span></div>
            <div><span className="text-muted-foreground">Room:</span><span className="ml-2 font-medium">{complaint.roomNumber}</span></div>
            <div><span className="text-muted-foreground">Student:</span><span className="ml-2 font-medium">{(complaint as any).user?.name || (complaint as any).user?.email}</span></div>
            <div><span className="text-muted-foreground">Submitted:</span><span className="ml-2">{new Date(complaint.createdAt).toLocaleDateString()}</span></div>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground">{complaint.description}</p>
          </div>
          {complaint.imageUrl && (
            <div className="border-t border-border pt-4 mt-4">
              <img src={complaint.imageUrl} alt="Complaint" className="w-full max-h-64 object-cover rounded-lg" />
            </div>
          )}
        </div>

        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Timeline</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Complaint submitted</p>
                <p className="text-xs text-muted-foreground">{new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{c.admin?.name || "Admin"} added a remark</p>
                  <p className="text-sm text-muted-foreground">{c.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {complaint.status === "RESOLVED" && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Marked as resolved</p>
                  <p className="text-xs text-muted-foreground">{new Date(complaint.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border px-6 py-4">
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add admin remark..."
                data-testid="admin-remark-input"
                className="flex-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
              <button
                type="submit"
                disabled={addComment.isPending || !comment.trim()}
                data-testid="add-remark-button"
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-foreground mb-4">Update Complaint</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
              <select
                value={newStatus || complaint.status}
                onChange={(e) => setNewStatus(e.target.value)}
                data-testid="status-update-select"
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Priority</label>
              <select
                value={newPriority || complaint.priority}
                onChange={(e) => setNewPriority(e.target.value)}
                data-testid="priority-update-select"
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <button
              onClick={handleUpdate}
              disabled={updateComplaint.isPending}
              data-testid="update-complaint-button"
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {updateComplaint.isPending ? "Updating..." : "Update Complaint"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminComplaintDetailPage() {
  const [, params] = useRoute("/admin/complaints/:id");
  const id = params?.id;
  return (
    <AuthGuard adminOnly>
      <AppLayout>
        {id ? <AdminComplaintDetail id={id} /> : <div>Not found</div>}
      </AppLayout>
    </AuthGuard>
  );
}
