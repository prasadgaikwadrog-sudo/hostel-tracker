import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart2,
  Settings,
  LogOut,
  Shield,
  ClipboardList,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  studentOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "My Complaints", href: "/complaints", icon: <FileText size={18} />, studentOnly: true },
  { label: "New Complaint", href: "/complaints/new", icon: <PlusCircle size={18} />, studentOnly: true },
  { label: "Admin Dashboard", href: "/admin", icon: <Shield size={18} />, adminOnly: true },
  { label: "All Complaints", href: "/admin/complaints", icon: <ClipboardList size={18} />, adminOnly: true },
  { label: "Weekly Report", href: "/admin/weekly-report", icon: <BarChart2 size={18} />, adminOnly: true },
  { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const filtered = navItems.filter((item) => {
    if (item.adminOnly && user?.role !== "ADMIN") return false;
    if (item.studentOnly && user?.role !== "STUDENT") return false;
    return true;
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground leading-tight">Hostel Tracker</p>
            <p className="text-xs text-sidebar-foreground/50">Issue Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {filtered.map((item) => {
          const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <span className={active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50"}>
                  {item.icon}
                </span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-sidebar-foreground/90 truncate">{user?.name || user?.email}</p>
          <p className="text-xs text-sidebar-foreground/40 capitalize">{user?.role?.toLowerCase()}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
