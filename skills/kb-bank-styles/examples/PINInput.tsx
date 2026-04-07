import * as React from 'react'

interface PINInputProps {
  length?: number
  value: string
  error?: boolean
}

/**
 * 간편비밀번호 입력 도트 표시. 실제 입력은 NumericKeypad와 함께 사용.
 */
export default function PINInput({ length = 6, value, error = false }: PINInputProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length
        return (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition ${
              error
                ? 'bg-negative'
                : filled
                  ? 'bg-kb-black'
                  : 'border border-line-2 bg-transparent'
            }`}
          />
        )
      })}
    </div>
  )
}
