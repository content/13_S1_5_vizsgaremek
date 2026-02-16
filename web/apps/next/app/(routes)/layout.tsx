import { DashboardSidebar } from "@/components/dashboard-sidebar-prodiver"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { ReactNode } from "react"

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <DashboardSidebar>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </DashboardSidebar>
  )
}
