import { AuthGuard } from '@/components/layout/auth-guard'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex-1 py-8">{children}</main>
        <footer className="border-t py-4 text-center text-xs text-muted-foreground">
          RoboSelect · MVP · экономические показатели — заглушка
        </footer>
      </div>
    </AuthGuard>
  )
}
