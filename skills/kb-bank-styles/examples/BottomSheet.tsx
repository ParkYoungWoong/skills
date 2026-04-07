import * as React from 'react'
import { useEffect, type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * 모바일 표준 바텀시트.
 * - 배경 dim 클릭으로 닫힘
 * - body 스크롤 잠금
 * - 슬라이드 업 트랜지션
 */
export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}>
      {/* dim */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-kb-black/40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[24px] bg-surface px-5 pb-8 pt-3 shadow-[0_-8px_24px_rgba(25,31,40,0.08)] transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line-2" />
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-ink-3 hover:bg-line">
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
