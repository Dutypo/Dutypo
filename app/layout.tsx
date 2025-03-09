import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['cyrillic'],
})

export const metadata: Metadata = {
  title: 'Dutypo',
  description: '엔트리에서 모션그래픽을 만들기 위한 편집기',
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang='ko' className='h-full'>
      <body className={`${notoSansKR.className} antialiased h-full`}>
        {children}
      </body>
    </html>
  )
}
