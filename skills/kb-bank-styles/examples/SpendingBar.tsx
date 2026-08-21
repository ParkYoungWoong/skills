import * as React from 'react'

export type CategoryTone = 1 | 2 | 3 | 4 | 5

/**
 * Tailwind v4는 소스에 문자열로 등장한 클래스만 생성한다.
 * `bg-cat-${n}` 처럼 런타임에 조립하면 클래스가 만들어지지 않으므로,
 * 리터럴을 그대로 담은 매핑을 둔다.
 */
const TONE_BG: Record<CategoryTone, string> = {
  1: 'bg-cat-1',
  2: 'bg-cat-2',
  3: 'bg-cat-3',
  4: 'bg-cat-4',
  5: 'bg-cat-5'
}

export interface SpendingSegment {
  label: string
  amount: number
  tone: CategoryTone
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
    <div className="rounded-lg bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-body font-bold text-ink">{title}</h3>
        {period && <span className="text-caption text-ink-3">{period}</span>}
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-display-3 font-bold tabular-nums text-ink">
          {sum.toLocaleString('ko-KR')}
        </span>
        <span className="text-base font-bold text-ink-2">원</span>
        {total > 0 && (
          <span className="ml-2 text-caption text-ink-3">
            / 예산 {total.toLocaleString('ko-KR')}원
          </span>
        )}
      </div>

      <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-line">
        {segments.map(seg => (
          <div
            key={seg.label}
            className={`h-full ${TONE_BG[seg.tone]}`}
            style={{ width: `${(seg.amount / sum) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2.5 text-label">
        {segments.map(seg => (
          <li
            key={seg.label}
            className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-2">
              <span className={`h-2 w-2 rounded-full ${TONE_BG[seg.tone]}`} />
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
