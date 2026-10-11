"use client";

import { OpsFrame } from "@/components/ops/frame";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <OpsFrame nav>{children}</OpsFrame>;
}
