import * as React from 'react'
import BottomSheet from './BottomSheet'

interface TransferConfirmSheetProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  fromAccount: string
  toBank: string
  toAccount: string
  toName: string
  amount: number
  fee?: number
}

/**
 * 송금 확인 바텀시트 — "정말 보낼까요?" 단계.
 */
export default function TransferConfirmSheet({
  open,
  onClose,
  onConfirm,
  fromAccount,
  toBank,
  toAccount,
  toName,
  amount,
  fee = 0
}: TransferConfirmSheetProps) {
  const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="송금 정보를 확인하세요">
      <div className="rounded-2xl bg-bg p-5">
        <div className="text-center">
          <p className="text-[13px] text-ink-3">받는 분</p>
          <p className="mt-1 text-[20px] font-bold text-ink">{toName}</p>
          <p className="mt-1 text-[13px] text-ink-2">
            {toBank} {toAccount}
          </p>
        </div>

        <div className="my-5 h-px bg-line-2" />

        <div className="space-y-2.5 text-[14px]">
          <Row
            label="보낼 금액"
            value={
              <span className="text-[18px] font-bold text-ink tabular-nums">{won(amount)}</span>
            }
          />
          <Row
            label="수수료"
            value={fee === 0 ? '무료' : won(fee)}
          />
          <Row
            label="출금 계좌"
            value={fromAccount}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={onClose}
          className="h-13 rounded-xl bg-line py-3.5 text-[15px] font-bold text-ink hover:bg-line-2">
          취소
        </button>
        <button
          onClick={onConfirm}
          className="h-13 rounded-xl bg-kb-yellow py-3.5 text-[15px] font-bold text-kb-black transition hover:bg-kb-yellow-strong active:scale-[0.98]">
          {won(amount)} 보내기
        </button>
      </div>
    </BottomSheet>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-3">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}
