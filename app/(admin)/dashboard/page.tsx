"use client";

import { useAuth } from "@/lib/auth";
import { LstDashboard } from "./lst-dashboard";
import { VenueDashboard } from "./venue-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "lst-admin" ? <LstDashboard /> : <VenueDashboard />;
}
