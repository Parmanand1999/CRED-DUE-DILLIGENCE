import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

import useAuthStore from "@/store/useAuthStore";
import { THEME_MAP } from "@/config/themeConfig";
import Navbar from "./Navbar";

const MainLayout = () => {
  const role = useAuthStore((state) => state.user?.roleName);

  const themeClass = THEME_MAP[role] || "admin-theme";

  return (
    <div className={`${themeClass} flex h-screen `}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Navbar */}
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-background p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
