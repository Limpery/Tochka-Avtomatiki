import { Bot } from 'lucide-react'
import Link from 'next/link'
import { GuestGuard } from '@/components/layout/guest-guard'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
        <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold">
          <Bot className="size-7 text-primary" />
          RoboSelect
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </GuestGuard>
  )
}
