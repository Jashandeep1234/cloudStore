import React, { createContext, useContext, useState, useCallback } from "react";

interface DriveContextType {
  currentFolderId: number | null;
  setCurrentFolderId: (id: number | null) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export const DriveProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <DriveContext.Provider
      value={{ currentFolderId, setCurrentFolderId, refreshKey, triggerRefresh }}
    >
      {children}
    </DriveContext.Provider>
  );
};

export const useDrive = () => {
  const ctx = useContext(DriveContext);
  if (!ctx) throw new Error("useDrive must be used inside <DriveProvider>");
  return ctx;
};
