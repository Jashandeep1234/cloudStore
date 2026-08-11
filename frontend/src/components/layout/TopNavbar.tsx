import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, RefreshCcw, Upload, FolderPlus, X, UserRound, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogout } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopNavbarProps {
  onMenuClick?: () => void;
  onUploadClick?: () => void;
  onNewFolderClick?: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";

export const TopNavbar = ({
  onMenuClick,
  onUploadClick,
  onNewFolderClick,
}: TopNavbarProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { mutate: handleLogout } = useLogout();
  const [searchValue, setSearchValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchValue.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      }
      if (e.key === "Escape") {
        setSearchValue("");
      }
    },
    [navigate, searchValue]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6">
      {/* Mobile menu toggle */}
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div
          className={cn(
            "flex items-center gap-2 px-3.5 h-10 rounded-xl border transition-all duration-200",
            isFocused
              ? "bg-white border-blue-400 shadow-sm shadow-blue-100 ring-2 ring-blue-100"
              : "bg-gray-50 border-gray-200 hover:border-gray-300"
          )}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            id="global-search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search files…"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none min-w-0"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Refresh */}
        <button
          id="navbar-refresh-btn"
          onClick={handleRefresh}
          title="Refresh"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all"
        >
          <RefreshCcw
            className={cn(
              "w-4 h-4 transition-transform duration-700",
              isRefreshing && "animate-spin"
            )}
          />
        </button>

        {/* New Folder */}
        <button
          id="navbar-new-folder-btn"
          onClick={onNewFolderClick}
          title="New Folder"
          className="flex items-center gap-2 px-3 h-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all"
        >
          <FolderPlus className="w-4 h-4 text-gray-500" />
          <span className="hidden lg:inline">New Folder</span>
        </button>

        {/* Upload */}
        <button
          id="navbar-upload-btn"
          onClick={onUploadClick}
          className="flex items-center gap-2 px-4 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold shadow-sm shadow-blue-200 hover:shadow-blue-300 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                {user?.picture && <AvatarImage src={user.picture} alt={user?.name ?? ""} />}
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                  {user ? getInitials(user.name) : <UserRound className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 mt-1">
            <div className="px-3 py-2.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate("/profile")} className="mt-1">
              <UserRound className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleLogout()}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
