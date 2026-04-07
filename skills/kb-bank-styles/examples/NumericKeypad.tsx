import * as React from 'react'
import { useMemo } from 'react'

interface NumericKeypadProps {
  onPress: (key: string) => void
  onBackspace: () => void
  onClear?: () => void
  shuffle?: boolean // 보안 키패드 (숫자 위치 랜덤)
}

/**
 * 보안 키패드. shuffle=true 시 매 마운트마다 숫자 위치를 섞는다.
 */
export default function NumericKeypad({
  onPress,
  onBackspace,
  onClear,
  shuffle = false
}: NumericKeypadProps) {
  const keys = useMemo(() => {
    const base = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    if (!shuffle) return base
    return [...base].sort(() => Math.random() - 0.5)
  }, [shuffle])

  const cells: (string | 'clear' | 'back')[] = [
    keys[0], keys[1], keys[2],
    keys[3], keys[4], keys[5],
    keys[6], keys[7], keys[8],
    onClear ? 'clear' : '',
    keys[9],
    'back'
  ]

  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-bg p-2">
      {cells.map((c, i) => {
        if (c === '') return <div key={i} />
        if (c === 'clear') {
          return (
            <button
              key={i}
              type="button"
              onClick={onClear}
              className="h-14 rounded-xl text-[14px] font-bold text-ink-2 hover:bg-line">
              전체삭제
            </button>
          )
        }
        if (c === 'back') {
          return (
            <button
              key={i}
              type="button"
              onClick={onBackspace}
              className="grid h-14 place-items-center rounded-xl text-ink-2 hover:bg-line">
              ⌫
            </button>
          )
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPress(c)}
            className="h-14 rounded-xl text-[22px] font-bold text-ink hover:bg-line active:scale-[0.97]">
            {c}
          </button>
        )
      })}
    </div>
  )
}
