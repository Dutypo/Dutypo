'use client'

import Link from 'next/link'

export function MenuLink({ children, href, kbd, onClick }: Readonly<{
  children?: React.ReactNode
  href: string
  kbd?: string
  onClick?: React.MouseEventHandler
}>) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className='block text-sm w-full text-left px-4 py-0.5 rounded-sm hover:bg-blue-600 hover:text-white'
    >
      {children}
      <kbd className='float-right pl-4'>{kbd}</kbd>
    </Link>
  )
}

export function MenuButton({ children, onClick, kbd }: Readonly<{
  children?: React.ReactNode
  onClick?: React.MouseEventHandler
  kbd?: string
}>) {
  return (
    <button
      onClick={onClick}
      className='cursor-pointer block text-sm w-full text-left px-4 py-0.5 rounded-sm hover:bg-blue-600 hover:text-white'
    >
      {children}
      <kbd className='float-right pl-4'>{kbd}</kbd>
    </button>
  )
}

export function ButtonsDiv({ children }: Readonly<{
  children?: React.ReactNode
}>) {
  return (
    <li className='p-1'>{children}</li>
  )
}

function Buttons({ children }: Readonly<{
  children?: React.ReactNode
}>) {
  return (
    <ul
      onPointerUp={e => e.stopPropagation()}
      className='absolute left-0 top-full bg-slate-800 border border-gray-400 rounded-lg w-max'
    >{children}</ul>
  )
}

export function HeaderMenu({ children, opened = false, name, onOpened, onClosed, onPointerEnter }: Readonly<{
  children?: React.ReactNode
  opened?: boolean
  name: string
  onOpened: React.PointerEventHandler<HTMLLIElement>
  onClosed: React.PointerEventHandler<HTMLLIElement>
  onPointerEnter: React.PointerEventHandler<HTMLLIElement>
}>) {
  return (
    <li
      onPointerDown={e => (opened || onOpened(e), e.stopPropagation())}
      onPointerUp={e => onClosed(e)}
      onPointerEnter={onPointerEnter}
      className={`relative text-sm px-2 py-0.5 rounded-md select-none ${opened ? 'bg-slate-900' : 'hover:bg-slate-900'}`}
    >
      {name}
      {opened ? <Buttons>{children}</Buttons> : []}
    </li>
  )
}
