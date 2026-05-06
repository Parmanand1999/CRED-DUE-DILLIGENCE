import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import useAuthStore from "@/store/useAuthStore";
import { logoutUser } from "@/features/authService/LogoutUser";
import { ChevronLeft, User, LogOut } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user?.roleName);

  const [collapsed, setCollapsed] = useState(false);

  const menuItems = ROUTES.filter(
    (route) =>
      route.showInSidebar &&
      (route.roles.length === 0 || route.roles.includes(user)),
  );

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div
      className={`
          top-0 left-0  h-screen
        bg-sidebar border-r flex flex-col justify-between
        transition-all duration-300

        ${collapsed ? "md:w-[70px]" : "md:w-[200px] "}
        w-[70px]
      `}
    >
      {/* TOP */}
      <div>
        {/* LOGO + TOGGLE */}
        <div className="flex items-center justify-between p-4 border-b h-18">
          {/* LOGO */}
          {!collapsed && (
            <div className="hidden md:block">
              <p className="font-bold text-white">CREDUBLANCE</p>
              <p className="text-xs text-gray-400">
                {user?.toUpperCase()} PORTAL
              </p>
            </div>
          )}

          {/* TOGGLE */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block cursor-pointer text-white"
          >
            <ChevronLeft
              size={18}
              className={`transition ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* MENU */}
        <div className="mt-4 space-y-1 px-2 ">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.label}
                className="relative group shadow-md rounded-lg"
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold transition
                                            ${
                                              isActive
                                                ? "bg-[#5b42c3] text-white hover:bg-[#5b42c3]"
                                                : "text-textsecondary  hover:bg-primary hover:text-white "
                                            }
                                          ${collapsed ? "justify-center" : ""}
                                        `}
                >
                  <Icon size={18} />

                  {/* TEXT */}
                  <span
                    className={`${collapsed ? "hidden" : "hidden md:inline"}`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* TOOLTIP (only when collapsed) */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 
                    bg-black text-white text-xs px-2 py-1 rounded 
                    opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50"
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div className={`p-4 border-t ${collapsed ? "px-2" : ""}`}>
        <div
          className={`grid gap-2 ${collapsed ? "grid-cols-1" : "grid-cols-1"}`}
        >
          <Link
            to="/profile"
            className={`p-1 flex items-center justify-center rounded-lg border border-[#d9b040] bg-white text-[#0b1f3a] hover:bg-[#fcf7df] transition cursor-pointer ${collapsed ? "w-full" : ""}`}
            title="Profile"
          >
            <div className="flex gap-1 items-center">
              <User size={18} />
              <span className="hidden md:inline text-sm font-semibold">
                Profile
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className={` flex p-1 items-center justify-center rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition cursor-pointer ${collapsed ? "w-full" : ""}`}
            title="Logout"
          >
            <div className="flex gap-1 items-center">
              <LogOut size={18} />
              <span className="hidden md:inline text-sm font-semibold">
                Logout
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
