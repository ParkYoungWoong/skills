import * as React from 'react'
import { useState } from 'react'

interface AccountCardProps {
  name: string
  number: string
  balance: number
  hideToggle?: boolean
  onTransfer?: () => void
  onHistory?: () => void
  onAtm?: () => void
}

export default function AccountCard({
  name,
  number,
  balance,
  hideToggle = true,
  onTransfer,
  onHistory,
  onAtm
}: AccountCardProps) {
  const [hidden, setHidden] = useState(false)

  return (
    <div className="rounded-[20px] bg-surface p-7 shadow-[0_2px_10px_rgba(25,31,40,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-kb-yellow-soft">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="2.2">
              <rect
                x="3"
                y="6"
                width="18"
                height="13"
                rx="2"
              />
              <path d="M3 10h18" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] text-ink-3">{number}</p>
            <p className="text-[15px] font-bold text-ink">{name}</p>
          </div>
        </div>
        {hideToggle && (
          <button
            onClick={() => setHidden(h => !h)}
            className="rounded-full border border-line-2 px-3 py-1 text-xs text-ink-2 hover:bg-line">
            {hidden ? '보기' : '숨기기'}
          </button>
        )}
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-[40px] font-bold tracking-tight tabular-nums text-ink">
          {hidden ? '••••••••' : balance.toLocaleString('ko-KR')}
        </span>
        <span className="text-2xl font-bold text-ink-2">원</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          onClick={onTransfer}
          className="h-12 rounded-xl bg-kb-yellow text-[15px] font-bold text-kb-black transition hover:bg-kb-yellow-strong active:scale-[0.98]">
          송금
        </button>
        <button
          onClick={onHistory}
          className="h-12 rounded-xl bg-line text-[15px] font-bold text-ink hover:bg-line-2">
          내역
        </button>
        <button
          onClick={onAtm}
          className="h-12 rounded-xl bg-line text-[15px] font-bold text-ink hover:bg-line-2">
          ATM
        </button>
      </div>
    </div>
  )
}
