import * as React from 'react'
import { useState } from 'react'

interface AmountInputProps {
  value?: number
  onChange?: (n: number) => void
  max?: number
  placeholder?: string
}

/**
 * 금액 전용 입력 — 천단위 콤마 + "원" 접미사 + 큰 디스플레이.
 * 송금/이체 화면 핵심.
 */
export default function AmountInput({
  value = 0,
  onChange,
  max = 100_000_000,
  placeholder = '얼마를 보낼까요?'
}: AmountInputProps) {
  const [internal, setInternal] = useState(value)
  const display = internal === 0 ? '' : internal.toLocaleString('ko-KR')

  const handle = (raw: string) => {
    const n = Number(raw.replace(/[^0-9]/g, ''))
    if (Number.isNaN(n) || n > max) return
    setInternal(n)
    onChange?.(n)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-1">
        <input
          inputMode="numeric"
          value={display}
          onChange={e => handle(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[40px] font-bold tracking-tight tabular-nums text-ink outline-none placeholder:text-ink-4"
        />
        {internal > 0 && <span className="text-2xl font-bold text-ink-2">원</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {[10_000, 50_000, 100_000, 500_000, 1_000_000].map(amount => (
          <button
            key={amount}
            type="button"
            onClick={() => handle(String(internal + amount))}
            className="rounded-full border border-line-2 px-3 py-1.5 text-[12px] font-semibold text-ink-2 hover:bg-line">
            +{amount.toLocaleString('ko-KR')}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handle('0')}
          className="rounded-full border border-line-2 px-3 py-1.5 text-[12px] font-semibold text-ink-2 hover:bg-line">
          정정
        </button>
      </div>
    </div>
  )
}
