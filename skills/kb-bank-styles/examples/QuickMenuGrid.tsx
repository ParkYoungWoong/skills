import * as React from 'react'

interface MenuItem {
  label: string
  icon: string
  onClick?: () => void
  highlight?: boolean
}

interface QuickMenuGridProps {
  items: MenuItem[]
  columns?: number
}

export default function QuickMenuGrid({ items, columns = 4 }: QuickMenuGridProps) {
  return (
    <div className="rounded-lg bg-surface p-6 shadow-card">
      <h3 className="font-display text-body font-bold text-ink">자주 쓰는 메뉴</h3>
      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {items.map(m => (
          <button
            key={m.label}
            onClick={m.onClick}
            className="flex flex-col items-center gap-2 rounded-xl py-3 transition hover:bg-bg active:scale-[0.97]">
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl text-xl font-bold ${
                m.highlight
                  ? 'bg-kb-yellow-soft text-kb-black'
                  : 'bg-line text-ink-2'
              }`}>
              {m.icon}
            </div>
            <span className="text-caption font-medium text-ink-2">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
