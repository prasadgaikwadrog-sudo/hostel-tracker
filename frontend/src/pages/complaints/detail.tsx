import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useGetComplaint, getGetComplaintQueryKey } from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Download, QrCode, Clock, CheckCircle, AlertCircle } from "lucide-react";

function ComplaintDetail({ id }: { id: string }) {
  const { data: complaint, isLoading } = useGetComplaint(id, {
    query: { queryKey: getGetComplaintQueryKey(id) }
  });

  const handleDownloadQr = () => {
    if (!complaint?.qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = complaint.qrCodeUrl;
    a.download = `complaint-${id}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            <div className="flex items-center gap-2 flex-shrink-0">
              <PriorityBadge priority={complaint.priority as any} />
              <StatusBadge status={complaint.status as any} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2 text-foreground font-medium">{complaint.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Room:</span>
              <span className="ml-2 text-foreground font-medium">{complaint.roomNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Submitted:</span>
              <span className="ml-2 text-foreground">{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <span className="ml-2 text-foreground">{new Date(complaint.updatedAt).toLocaleDateString()}</span>
            </div>
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
            <h2 className="font-semibold text-sm text-foreground">Timeline & Remarks</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Complaint submitted</p>
                  <p className="text-xs text-muted-foreground">{new Date(complaint.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{comment.admin?.name || "Admin"}</p>
                    <p className="text-sm text-muted-foreground">{comment.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {complaint.status === "RESOLVED" && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Issue resolved</p>
                    <p className="text-xs text-muted-foreground">{new Date(complaint.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={16} className="text-muted-foreground" />
            <h3 className="font-semibold text-sm text-foreground">QR Code</h3>
          </div>
          {complaint.qrCodeUrl ? (
            <>
              <div className="bg-white rounded-lg p-3 border border-border mb-3 flex items-center justify-center">
                <img
                  src={complaint.qrCodeUrl}
                  alt="Complaint QR Code"
                  className="w-40 h-40 object-contain"
                  data-testid="qr-code-image"
                />
              </div>
              <button
                onClick={handleDownloadQr}
                data-testid="download-qr-button"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download size={14} />
                Download QR
              </button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Scan to track this complaint publicly
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">QR code generating...</p>
          )}
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-2">Submitted by</p>
          <p className="text-sm font-medium text-foreground">{(complaint as any).user?.name || "Student"}</p>
          <p className="text-xs text-muted-foreground">{(complaint as any).user?.email}</p>
        </div>
      </div>
    </div>
  );
}

export default function ComplaintDetailPage() {
  const [, params] = useRoute("/complaints/:id");
  const id = params?.id;

  return (
    <AuthGuard>
      <AppLayout>
        {id ? <ComplaintDetail id={id} /> : <div>Not found</div>}
      </AppLayout>
    </AuthGuard>
  );
}
