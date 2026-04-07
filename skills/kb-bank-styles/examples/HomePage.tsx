import * as React from 'react'
import AccountCard from './AccountCard'
import TransactionItem from './TransactionItem'
import QuickMenuGrid from './QuickMenuGrid'

/**
 * KB 스타일 모바일 뱅킹 홈 페이지 풀 템플릿
 * - assets/tokens.css 가 프로젝트에 import 되어 있어야 한다.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* App-style top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[480px] items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-kb-yellow text-kb-black">
              <span className="text-sm font-bold">★</span>
            </div>
            <span className="text-base font-bold">마음뱅크</span>
          </div>
          <div className="flex items-center gap-1 text-ink-2">
            <button className="rounded-lg p-2 hover:bg-line">🔍</button>
            <button className="rounded-lg p-2 hover:bg-line">🔔</button>
            <button className="rounded-lg p-2 hover:bg-line">≡</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] space-y-5 px-5 py-6">
        {/* 인사 */}
        <div>
          <h1 className="text-[24px] font-bold leading-tight">
            안녕하세요, <span className="text-kb-yellow-strong">이수진</span>님
          </h1>
          <p className="mt-1 text-[14px] text-ink-2">오늘도 안전하게 거래하세요</p>
        </div>

        <AccountCard
          name="입출금통장"
          number="110-***-482910"
          balance={12442910}
        />

        <QuickMenuGrid
          items={[
            { label: '계좌송금', icon: '↑', highlight: true },
            { label: '내계좌', icon: '◎', highlight: true },
            { label: '공과금', icon: '☐', highlight: true },
            { label: '환전', icon: '⇋', highlight: true },
            { label: '카드', icon: '▭' },
            { label: '대출', icon: '＄' },
            { label: '예적금', icon: '★' },
            { label: '더보기', icon: '＋' }
          ]}
        />

        {/* 거래내역 */}
        <div className="rounded-2xl bg-surface p-6 shadow-[0_2px_10px_rgba(25,31,40,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">최근 거래내역</h2>
            <a className="text-[12px] font-medium text-ink-2">전체보기 ›</a>
          </div>
          <ul className="mt-2 divide-y divide-line">
            <TransactionItem
              merchant="스타벅스 광화문점"
              category="카페"
              time="14:22"
              amount={-6800}
              balanceAfter={12442910}
            />
            <TransactionItem
              merchant="월급 (주)아틀리에"
              category="급여"
              time="09:00"
              amount={4820000}
              balanceAfter={12449710}
            />
            <TransactionItem
              merchant="쿠팡"
              category="쇼핑"
              time="어제 21:14"
              amount={-38900}
              balanceAfter={7629710}
            />
          </ul>
        </div>

        {/* 프로모 */}
        <div className="overflow-hidden rounded-2xl bg-kb-yellow p-6 text-kb-black">
          <p className="text-[12px] font-bold opacity-80">신규 이벤트</p>
          <p className="mt-1 text-[18px] font-bold leading-snug">
            첫 적금 가입하고
            <br />
            커피 쿠폰 받기 ☕
          </p>
          <button className="mt-4 rounded-full bg-kb-black px-4 py-2 text-[13px] font-bold text-kb-yellow">
            자세히 보기
          </button>
        </div>
      </main>
    </div>
  )
}
