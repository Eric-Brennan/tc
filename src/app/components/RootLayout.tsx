import React from "react";
import { Outlet } from "react-router";
import { Toaster } from "./ui/sonner";
import AuthGuard from "./AuthGuard";

export default function RootLayout() {
  return (
    <AuthGuard>
      <Outlet />
      <Toaster />
    </AuthGuard>
  );
}