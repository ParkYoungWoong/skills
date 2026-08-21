import * as React from 'react'

import type { CategoryTone } from './SpendingBar'

/** 카테고리 팔레트 토큰(--color-cat-*)을 그대로 참조한다. */
const TONE_COLOR: Record<CategoryTone, string> = {
  1: 'var(--color-cat-1)',
  2: 'var(--color-cat-2)',
  3: 'var(--color-cat-3)',
  4: 'var(--color-cat-4)',
  5: 'var(--color-cat-5)'
}

export interface DonutSlice {
  label: string
  value: number
  tone: CategoryTone
}

interface CategoryDonutProps {
  slices: DonutSlice[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string
}

/**
 * SVG 도넛 차트. 의존성 없음.
 */
export default function CategoryDonut({
  slices,
  size = 180,
  thickness = 22,
  centerLabel,
  centerValue
}: CategoryDonutProps) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={thickness}
          />
          {slices.map(s => {
            const len = (s.value / total) * c
            const dash = `${len} ${c - len}`
            const offset = c / 4 - acc
            acc += len
            return (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={TONE_COLOR[s.tone]}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && (
            <span className="text-micro font-semibold text-ink-3">{centerLabel}</span>
          )}
          {centerValue && (
            <span className="mt-1 text-heading font-bold text-ink">{centerValue}</span>
          )}
        </div>
      </div>

      <ul className="space-y-2 text-label">
        {slices.map(s => {
          const pct = Math.round((s.value / total) * 100)
          return (
            <li
              key={s.label}
              className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: TONE_COLOR[s.tone] }}
              />
              <span className="text-ink-2">{s.label}</span>
              <span className="ml-auto font-bold tabular-nums text-ink">{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
