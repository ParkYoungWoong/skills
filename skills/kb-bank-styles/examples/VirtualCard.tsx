import * as React from 'react'
import { useState } from 'react'

interface VirtualCardProps {
  brand?: string // 예: "마음카드 The Star"
  number: string // "4242000012349217"
  holder: string // "SOOJIN LEE"
  expiry: string // "12/28"
  type?: 'credit' | 'check'
}

/**
 * 가상 카드 시각 표현. 카드번호 마스킹 토글 포함.
 * KB 옐로우 + 다크 톤 그라디언트.
 */
export default function VirtualCard({
  brand = '마음카드 The Star',
  number,
  holder,
  expiry,
  type = 'credit'
}: VirtualCardProps) {
  const [reveal, setReveal] = useState(false)
  const formatted = number
    .replace(/(\d{4})/g, '$1 ')
    .trim()
  const masked = formatted.replace(/\d(?=\d{4})/g, '•')

  return (
    <div className="relative aspect-[1.6/1] overflow-hidden rounded-2xl p-6 text-kb-black shadow-[0_8px_24px_rgba(25,31,40,0.12)]"
      style={{
        background:
          'linear-gradient(135deg, #FFD43A 0%, #FFBC00 50%, #E3A500 100%)'
      }}>
      <div
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 60%)' }}
      />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              {type === 'credit' ? 'CREDIT' : 'CHECK'}
            </p>
            <p className="mt-1 text-[15px] font-bold">{brand}</p>
          </div>
          <div className="grid h-9 w-12 place-items-center rounded-md bg-kb-black/20 text-[9px] font-bold uppercase tracking-widest">
            chip
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setReveal(r => !r)}
            className="font-mono text-[18px] font-bold tracking-[0.15em] hover:opacity-80">
            {reveal ? formatted : masked}
          </button>
          <div className="mt-3 flex items-end justify-between text-[11px]">
            <div>
              <p className="font-bold uppercase tracking-widest opacity-70">Cardholder</p>
              <p className="mt-0.5 text-[13px] font-bold">{holder}</p>
            </div>
            <div className="text-right">
              <p className="font-bold uppercase tracking-widest opacity-70">Valid Thru</p>
              <p className="mt-0.5 text-[13px] font-bold tabular-nums">{expiry}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
