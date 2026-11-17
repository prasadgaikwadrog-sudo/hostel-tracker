import { useRoute } from "wouter";
import { useGetComplaint, getGetComplaintQueryKey } from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";

function TrackPage({ id }: { id: string }) {
  const { data: complaint, isLoading } = useGetComplaint(id, {
    query: { queryKey: getGetComplaintQueryKey(id) }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-3">
            <Shield size={22} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Hostel Issue Tracker</h1>
          <p className="text-slate-400 text-sm">Complaint Status</p>
        </div>

        {isLoading ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !complaint ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center">
            <p className="text-slate-400">Complaint not found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="font-bold text-white text-lg">{complaint.title}</h2>
                <StatusBadge status={complaint.status as any} />
              </div>

              <p className="text-slate-300 text-sm mb-4">{complaint.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Category</p>
                  <p className="text-white font-medium">{complaint.category}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Room</p>
                  <p className="text-white font-medium">{complaint.roomNumber}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Priority</p>
                  <PriorityBadge priority={complaint.priority as any} />
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Submitted</p>
                  <p className="text-white font-medium text-xs">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white text-sm mb-4">Updates & Remarks</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle size={12} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Complaint submitted</p>
                    <p className="text-xs text-slate-500">{new Date(complaint.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {((complaint as any).comments || []).map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={12} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{comment.message}</p>
                      <p className="text-xs text-slate-500">{comment.admin?.name} &bull; {new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                {complaint.status === "RESOLVED" && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={12} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-green-400 font-medium">Issue resolved</p>
                      <p className="text-xs text-slate-500">{new Date(complaint.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackComplaintPage() {
  const [, params] = useRoute("/track/:id");
  const id = params?.id;
  return id ? <TrackPage id={id} /> : <div className="p-8 text-center text-white">Invalid link</div>;
}
