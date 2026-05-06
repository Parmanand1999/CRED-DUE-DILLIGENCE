import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { COMPONENTS } from "./routeComponents";
import PrivateRoute from "./PrivateRoute";
import Layout from "@/layouts/MainLayout";
import useAuthStore from "@/store/useAuthStore";

const AppRouter = () => {
  const user = useAuthStore((state) => state?.user?.roleName);

  // const user = { role: "admin" }
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: ROUTES.filter((r) => r.isPrivate)
        .filter(
          (route) => route.roles.length === 0 || route.roles.includes(user),
        )
        .map((route) => {
          const Component = COMPONENTS[route.element];

          if (!Component) {
            console.error("Component not found:", route.element);
            return null;
          }
          console.log("ROUTES:", ROUTES);
          console.log("USER:", user);
          if (route.index) {
            return {
              index: true,
              element: (
                <PrivateRoute>
                  <Component />
                </PrivateRoute>
              ),
            };
          }

          return {
            path: route.path,
            element: (
              <PrivateRoute>
                <Component />
              </PrivateRoute>
            ),
          };
        }),
    },

    ...ROUTES.filter((r) => !r.isPrivate).map((route) => {
      const Component = COMPONENTS[route.element];

      return {
        path: route.path,
        element: <Component />,
      };
    }),
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
