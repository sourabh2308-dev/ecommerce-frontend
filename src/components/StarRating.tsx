import { Star } from 'lucide-react'

interface Props { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }

export function StarRating({ value, onChange, size = 'md' }: Props) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sz} transition-colors ${
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } ${onChange ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  )
}
