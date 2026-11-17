import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useCreateComplaint, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

const CATEGORIES = ["Plumbing", "Electrical", "Furniture", "Cleanliness", "Internet", "Security", "Other"];

export default function NewComplaintPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("auto");
  const [roomNumber, setRoomNumber] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const createComplaint = useCreateComplaint();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !roomNumber) return;

    createComplaint.mutate(
      {
        data: {
          title,
          description,
          category: category === "auto" ? undefined : category,
          roomNumber,
          imageUrl: imageUrl ?? null,
        },
      },
      {
        onSuccess: (data: any) => {
          queryClient.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
          toast({ title: "Complaint submitted!", description: "Your QR code has been generated." });
          setLocation(`/complaints/${data.id}`);
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err?.data?.message || "Failed to submit complaint", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Submit Complaint</h1>
            <p className="text-muted-foreground text-sm mt-1">Report a hostel issue and get a QR code for tracking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Issue Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  placeholder="e.g. Water leaking from ceiling"
                  data-testid="title-input"
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  data-testid="description-input"
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    data-testid="category-select"
                    className="w-full px-3 py-2.5 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  >
                    <option value="auto">Auto-detect from description</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Room Number *</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    placeholder="e.g. B-204"
                    data-testid="room-number-input"
                    className="w-full px-3 py-2.5 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Image (optional)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setImageUrl(null); }}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                      <Upload size={24} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" data-testid="image-upload" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={createComplaint.isPending}
                data-testid="submit-complaint-button"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createComplaint.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Submit & Generate QR Code
              </button>
              <button
                type="button"
                onClick={() => setLocation("/dashboard")}
                className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
