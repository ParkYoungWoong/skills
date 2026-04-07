import * as React from 'react'

interface TransactionItemProps {
  merchant: string
  category: string
  time: string
  amount: number // 양수=입금, 음수=출금
  balanceAfter?: number
}

export default function TransactionItem({
  merchant,
  category,
  time,
  amount,
  balanceAfter
}: TransactionItemProps) {
  const income = amount > 0
  const sign = income ? '+' : '−'
  const display = `${sign}${Math.abs(amount).toLocaleString('ko-KR')}원`

  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            income ? 'bg-kb-yellow-soft text-kb-black' : 'bg-line text-ink-2'
          }`}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2">
            {income ? (
              <path d="M12 19V5M5 12l7-7 7 7" />
            ) : (
              <path d="M12 5v14M5 12l7 7 7-7" />
            )}
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-bold text-ink">{merchant}</p>
          <p className="text-[12px] text-ink-3">
            {category} · {time}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-[15px] font-bold tabular-nums ${
            income ? 'text-info' : 'text-ink'
          }`}>
          {display}
        </p>
        {balanceAfter !== undefined && (
          <p className="text-[12px] text-ink-3 tabular-nums">
            잔액 {balanceAfter.toLocaleString('ko-KR')}원
          </p>
        )}
      </div>
    </li>
  )
}
