import * as React from 'react'
import { useEffect, type ReactNode } from 'react'

/* ============================================================
 * EmptyState — 데이터 없음 표시
 * ============================================================ */
export function EmptyState({
  icon = '◌',
  title,
  description,
  action
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-line text-3xl text-ink-3">
        {icon}
      </div>
      <p className="mt-4 text-[16px] font-bold text-ink">{title}</p>
      {description && (
        <p className="mt-1 text-[13px] text-ink-3">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ============================================================
 * Skeleton — 로딩 자리표시자
 * ============================================================ */
export function Skeleton({
  className = '',
  rounded = 'rounded-md'
}: {
  className?: string
  rounded?: string
}) {
  return (
    <div
      className={`animate-pulse bg-line ${rounded} ${className}`}
      aria-hidden
    />
  )
}

/** 자주 쓰는 조합: 계좌 카드 스켈레톤 */
export function AccountCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-7 shadow-[0_2px_10px_rgba(25,31,40,0.04)]">
      <div className="flex items-center gap-3">
        <Skeleton
          className="h-10 w-10"
          rounded="rounded-xl"
        />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton
          className="h-12"
          rounded="rounded-xl"
        />
        <Skeleton
          className="h-12"
          rounded="rounded-xl"
        />
        <Skeleton
          className="h-12"
          rounded="rounded-xl"
        />
      </div>
    </div>
  )
}

/* ============================================================
 * Toast — 일시적 알림 (단일 인스턴스 모드)
 * ============================================================ */
interface ToastProps {
  open: boolean
  onClose: () => void
  message: string
  variant?: 'success' | 'error' | 'info'
  duration?: number
}

export function Toast({
  open,
  onClose,
  message,
  variant = 'info',
  duration = 2500
}: ToastProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  const icon = variant === 'success' ? '✓' : variant === 'error' ? '!' : 'ⓘ'
  const dotColor =
    variant === 'success'
      ? 'bg-positive'
      : variant === 'error'
        ? 'bg-negative'
        : 'bg-kb-yellow'

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6 transition ${
        open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      aria-live="polite">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-kb-black px-5 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(25,31,40,0.2)]">
        <span
          className={`grid h-5 w-5 place-items-center rounded-full ${dotColor} text-[11px] font-bold text-kb-black`}>
          {icon}
        </span>
        {message}
      </div>
    </div>
  )
}
