import { NavLink } from "react-router-dom";
import {
  HardDrive,
  Clock,
  Search,
  Trash2,
  UserRound,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAllFiles } from "@/hooks/useFiles";
import { formatBytes } from "@/utils/formatters";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", end: true },
  { icon: HardDrive, label: "My Drive", href: "/drive", end: false },
  { icon: Clock, label: "Recent", href: "/recent", end: false },
  { icon: Search, label: "Search", href: "/search", end: false },
  { icon: Sparkles, label: "AI Analysis", href: "/ai", end: false },
];

export const Sidebar = ({ className }: { className?: string }) => {
  const { data: files = [] } = useAllFiles();
  const usedBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
  // Assume a 5 GB limit for display
  const limitBytes = 5 * 1024 * 1024 * 1024;
  const usedPct = Math.min((usedBytes / limitBytes) * 100, 100);

  return (
    <aside
      className={cn(
        "w-[240px] flex-col bg-white border-r border-gray-100 shadow-sm hidden md:flex shrink-0",
        className
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200 shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <span className="font-bold text-sm text-gray-900 tracking-tight">CloudStore</span>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">File Manager</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-100" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                )}
                <span
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Storage Usage */}
      <div className="mx-4 mb-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-600">Storage</p>
          <p className="text-[10px] text-gray-400">{formatBytes(usedBytes)} / 5 GB</p>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-700"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">{usedPct.toFixed(1)}% used</p>
      </div>

      {/* Profile Footer */}
      <div className="p-3 border-t border-gray-100">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
              )}
              <span
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"
                )}
              >
                <UserRound className="w-4 h-4" />
              </span>
              Profile
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
