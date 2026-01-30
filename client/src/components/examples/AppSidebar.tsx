import { AppSidebar } from '../AppSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-64 w-full">
        <AppSidebar />
        <div className="flex-1 p-4 bg-background">
          <p className="text-muted-foreground">Contenido principal aquí</p>
        </div>
      </div>
    </SidebarProvider>
  )
}