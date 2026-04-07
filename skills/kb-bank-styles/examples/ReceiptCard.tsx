import * as React from 'react'

interface ReceiptCardProps {
  status?: 'success' | 'pending' | 'failed'
  amount: number
  fromName: string
  fromAccount: string
  toName: string
  toBank: string
  toAccount: string
  date: string // "2026.04.07 14:22:08"
  txId: string
}

const STATUS = {
  success: { label: '송금 완료', icon: '✓', color: 'text-positive', bg: 'bg-positive/15' },
  pending: { label: '처리 중', icon: '⋯', color: 'text-warn', bg: 'bg-warn/15' },
  failed: { label: '송금 실패', icon: '✕', color: 'text-negative', bg: 'bg-negative/15' }
}

/**
 * 송금 영수증 카드 — 캡처/공유용. 점선 톱니 디테일.
 */
export default function ReceiptCard({
  status = 'success',
  amount,
  fromName,
  fromAccount,
  toName,
  toBank,
  toAccount,
  date,
  txId
}: ReceiptCardProps) {
  const s = STATUS[status]
  return (
    <div className="rounded-2xl bg-surface shadow-[0_2px_10px_rgba(25,31,40,0.04)]">
      <div className="px-7 pt-7 text-center">
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${s.bg}`}>
          <span className={`text-2xl font-bold ${s.color}`}>{s.icon}</span>
        </div>
        <p className={`mt-3 text-[13px] font-bold ${s.color}`}>{s.label}</p>
        <p className="mt-2 text-[32px] font-bold tracking-tight tabular-nums text-ink">
          {amount.toLocaleString('ko-KR')}
          <span className="text-xl text-ink-2">원</span>
        </p>
      </div>

      {/* 톱니 구분선 */}
      <div className="relative my-6">
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-bg" />
        <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-bg" />
        <div className="border-t border-dashed border-line-2" />
      </div>

      <dl className="space-y-3 px-7 pb-7 text-[13px]">
        <Row label="보낸 사람" value={`${fromName} · ${fromAccount}`} />
        <Row label="받는 사람" value={toName} />
        <Row label="받는 계좌" value={`${toBank} ${toAccount}`} />
        <Row label="거래 일시" value={date} />
        <Row label="거래 번호" value={txId} mono />
      </dl>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-3">{label}</dt>
      <dd className={`text-right text-ink ${mono ? 'tabular-nums' : ''}`}>{value}</dd>
    </div>
  )
}
