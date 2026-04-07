import * as React from 'react'

export interface DonutSlice {
  label: string
  value: number
  color: string // hex
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
            stroke="#EEF0F3"
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
                stroke={s.color}
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
            <span className="text-[11px] font-semibold text-ink-3">{centerLabel}</span>
          )}
          {centerValue && (
            <span className="mt-1 text-[18px] font-bold text-ink">{centerValue}</span>
          )}
        </div>
      </div>

      <ul className="space-y-2 text-[13px]">
        {slices.map(s => {
          const pct = Math.round((s.value / total) * 100)
          return (
            <li
              key={s.label}
              className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
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
