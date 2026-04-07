import * as React from 'react'
import { useState, useMemo } from 'react'

export interface Term {
  id: string
  label: string
  required: boolean
  body?: string
}

interface TermsAccordionProps {
  terms: Term[]
  onChange?: (checked: Record<string, boolean>) => void
}

/**
 * 약관 동의 아코디언 — 필수/선택 분리, 전체동의 토글.
 * 한국 금융 가입 흐름 표준.
 */
export default function TermsAccordion({ terms, onChange }: TermsAccordionProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const allChecked = useMemo(
    () => terms.every(t => checked[t.id]),
    [terms, checked]
  )
  const requiredOk = useMemo(
    () => terms.filter(t => t.required).every(t => checked[t.id]),
    [terms, checked]
  )

  const update = (next: Record<string, boolean>) => {
    setChecked(next)
    onChange?.(next)
  }

  const toggleAll = () => {
    const v = !allChecked
    update(Object.fromEntries(terms.map(t => [t.id, v])))
  }

  const toggleOne = (id: string) => {
    update({ ...checked, [id]: !checked[id] })
  }

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-[0_2px_10px_rgba(25,31,40,0.04)]">
      <button
        type="button"
        onClick={toggleAll}
        className="flex w-full items-center gap-3 rounded-xl bg-bg px-4 py-4 text-left">
        <Check checked={allChecked} />
        <span className="text-[15px] font-bold text-ink">약관 전체 동의</span>
        <span className="ml-auto text-[12px] text-ink-3">
          {requiredOk ? '필수 항목 모두 동의' : '필수 항목을 확인하세요'}
        </span>
      </button>

      <ul className="mt-3 divide-y divide-line">
        {terms.map(t => {
          const isOpen = open[t.id]
          return (
            <li key={t.id}>
              <div className="flex items-center gap-3 py-3.5">
                <button
                  type="button"
                  onClick={() => toggleOne(t.id)}
                  className="flex flex-1 items-center gap-3 text-left">
                  <Check checked={!!checked[t.id]} />
                  <span className="text-[14px] text-ink">
                    <span className={t.required ? 'text-info' : 'text-ink-3'}>
                      [{t.required ? '필수' : '선택'}]
                    </span>{' '}
                    {t.label}
                  </span>
                </button>
                {t.body && (
                  <button
                    type="button"
                    onClick={() => setOpen(o => ({ ...o, [t.id]: !o[t.id] }))}
                    className="text-[12px] font-semibold text-ink-3 hover:text-ink">
                    {isOpen ? '접기' : '보기'}
                  </button>
                )}
              </div>
              {isOpen && t.body && (
                <div className="mb-3 max-h-40 overflow-y-auto rounded-lg bg-bg p-4 text-[12px] leading-relaxed text-ink-2">
                  {t.body}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Check({ checked }: { checked: boolean }) {
  return (
    <span
      className={`grid h-6 w-6 place-items-center rounded-full transition ${
        checked ? 'bg-kb-yellow text-kb-black' : 'border border-line-2 bg-surface text-ink-4'
      }`}>
      <span className="text-[14px] font-bold leading-none">✓</span>
    </span>
  )
}
