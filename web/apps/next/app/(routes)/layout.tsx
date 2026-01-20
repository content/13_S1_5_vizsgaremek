import { DashboardSidebar } from "@/components/dashboard-sidebar-prodiver"
import type { ReactNode } from "react"

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <DashboardSidebar>
      {children}
    </DashboardSidebar>
  )
}
