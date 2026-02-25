import { Loader2 } from 'lucide-react'

interface Props { message?: string; fullPage?: boolean }

export function Spinner({ message, fullPage }: Props) {
  const el = (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      {message && <p className="text-sm">{message}</p>}
    </div>
  )
  if (fullPage) return <div className="min-h-screen flex items-center justify-center">{el}</div>
  return <div className="py-16 flex items-center justify-center">{el}</div>
}
