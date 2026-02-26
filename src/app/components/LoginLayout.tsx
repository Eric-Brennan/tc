import React from "react";
import { Outlet } from "react-router";
import { Toaster } from "./ui/sonner";

/**
 * Layout for the /login route — no AuthGuard
 * (providers are supplied by App.tsx above RouterProvider).
 */
export default function LoginLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}