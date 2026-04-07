import * as React from 'react'

export interface SpendingSegment {
  label: string
  amount: number
  color: string // tailwind 클래스 (예: 'bg-cat-1')
}

interface SpendingBarProps {
  total: number
  segments: SpendingSegment[]
  title?: string
  period?: string
}

/**
 * 멀티 세그먼트 소비 바 + 카테고리 범례.
 * KB 카테고리 팔레트(--color-cat-*) 사용.
 */
export default function SpendingBar({
  total,
  segments,
  title = '이번 달 소비',
  period
}: SpendingBarProps) {
  const sum = segments.reduce((s, x) => s + x.amount, 0)

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-[0_2px_10px_rgba(25,31,40,0.04)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        {period && <span className="text-[12px] text-ink-3">{period}</span>}
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-[28px] font-bold tabular-nums text-ink">
          {sum.toLocaleString('ko-KR')}
        </span>
        <span className="text-base font-bold text-ink-2">원</span>
        {total > 0 && (
          <span className="ml-2 text-[12px] text-ink-3">
            / 예산 {total.toLocaleString('ko-KR')}원
          </span>
        )}
      </div>

      <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-line">
        {segments.map(seg => (
          <div
            key={seg.label}
            className={`h-full ${seg.color}`}
            style={{ width: `${(seg.amount / sum) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2.5 text-[13px]">
        {segments.map(seg => (
          <li
            key={seg.label}
            className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-2">
              <span className={`h-2 w-2 rounded-full ${seg.color}`} />
              {seg.label}
            </span>
            <span className="font-bold tabular-nums text-ink">
              {seg.amount.toLocaleString('ko-KR')}원
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
