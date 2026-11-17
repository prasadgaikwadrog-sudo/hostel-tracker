import { cn } from "@/lib/utils";

type Status = "PENDING" | "IN_PROGRESS" | "RESOLVED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const statusConfig: Record<Status, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
  RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700 border-green-200" },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-600 border-gray-200" },
  MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority] || priorityConfig.LOW;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  );
}
