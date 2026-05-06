import useAuthStore from "@/store/useAuthStore";

export const logoutUser = () => {
  // localStorage.removeItem("accessToken");
  // localStorage.removeItem("refreshToken");
  const logout = useAuthStore.getState().logout;
  logout();
  // localStorage.removeItem("auth-storage");

  window.location.href = "/login"; // Redirect to login page
  localStorage.clear();
};
