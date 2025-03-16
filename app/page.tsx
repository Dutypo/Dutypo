'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { ButtonsDiv, HeaderMenu, MenuButton, MenuLink } from './button'
import { createEntryProject, createMp4 } from './export'
import TODO from './todo'

let _openedMenu: string | undefined, _setOpenedMenu: Dispatch<SetStateAction<string | undefined>>

function Menu({ id, children, opened = _openedMenu == id, name }: Readonly<{
  id: string
  children?: React.ReactNode
  opened?: boolean
  name: string
}>) {
  const [ clicking, setClicking ] = useState(false)

  return (
    <HeaderMenu
      opened={opened}
      name={name}
      onOpened={() => (_setOpenedMenu(id), setClicking(true))}
      onClosed={() => clicking ? setClicking(false) : _setOpenedMenu(void 0)}
      onPointerEnter={() => typeof _openedMenu == 'string' && _setOpenedMenu(id)}
    >{children}</HeaderMenu>
  )
}

export default function Home() {
  const [ recording, setRecording ] = useState(false)
  const [ progress, setProgress ] = useState(0)
  const [ width, setWidth ] = useState(1920)
  const [ height, setHeight ] = useState(1080)
  const [ asideWidth, setAsideWidth ] = useState(1)
  const [ menuHeight, setMenuHeight ] = useState(0.5)
  const [ openedMenu, setOpenedMenu ] = useState<string>()
  const [ hovering, setHovering ] = useState(false)
  const [ fullscreen, setFullscreen ] = useState(false)
  const [ playing, setPlaying ] = useState(false)
  const [ fps, setFPS ] = useState(60)
  const [ useDummyCode ] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoPlayerRef = useRef<HTMLDivElement>(null)

  function rowResize(event: React.MouseEvent) {
    const mainHeight = innerHeight - 60
    const touchY = event.clientY - menuHeight * mainHeight
    function onPointerMove({ clientY }: MouseEvent) {
      setMenuHeight(Math.max(0, (clientY - touchY) / (innerHeight - 60)))
    }

    function onPointerUp() {
      removeEventListener('mousemove', onPointerMove)
      removeEventListener('mouseup', onPointerUp)
    }

    event.preventDefault()

    addEventListener('mousemove', onPointerMove)
    addEventListener('mouseup', onPointerUp)
  }

  function colResize(event: React.MouseEvent) {
    const mainWidth = innerWidth
    const touchX = event.clientX - asideWidth * mainWidth + (asideWidth == 1 ? 20 : 0)
    function onPointerMove({ clientX }: MouseEvent) {
      const width = (clientX - touchX) / innerWidth
      setAsideWidth(width > 0.95 ? 1 : width)
    }

    function onPointerUp() {
      removeEventListener('mousemove', onPointerMove)
      removeEventListener('mouseup', onPointerUp)
    }

    event.preventDefault()

    addEventListener('mousemove', onPointerMove)
    addEventListener('mouseup', onPointerUp)
  }

  useEffect(() => {
    const handler = () => document.fullscreenElement != videoPlayerRef.current && setFullscreen(false)
    addEventListener('fullscreenchange', handler)
    return () => removeEventListener('fullscreenchange', handler)
  }, [])

  const isOpened = typeof openedMenu == 'string'
  useEffect(() => {
    const handler = () => setOpenedMenu(void 0)
    if (isOpened) {
      addEventListener('blur', handler)
      addEventListener('pointerdown', handler)
    }
    return () => {
      removeEventListener('blur', handler)
      removeEventListener('pointerdown', handler)
    }
  }, [ isOpened ])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHovering(false)
    }, 3000)
    return () => clearTimeout(timeout)
  }, [ hovering ])

  async function exportToEntryProject() {
    if (recording) return

    const input = inputRef.current, canvas = canvasRef.current
    if (!input || !canvas) return
    const audio = input.files?.[0]
    if (!audio) return alert('오디오 파일을 선택해 주세요.')
    setPlaying(true)
    setRecording(true)
    setWidth(canvas.width = 640)
    setHeight(canvas.height = 360)
    const fps = 62.5
    setFPS(fps)

    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([ await createEntryProject({ fps, audio, canvas, useDummyCode, onProgress: setProgress }) ]))
    a.download = audio.name.replace(/(\.[^.]*)?$/, '.ent')
    a.click()
    setTimeout(URL.revokeObjectURL, 0, a.href)
    setRecording(false)
  }

  async function exportToMp4() {
    if (recording) return

    const input = inputRef.current, canvas = canvasRef.current
    if (!input || !canvas) return
    const audio = input.files?.[0]
    if (!audio) return alert('오디오 파일을 선택해 주세요.')
    setPlaying(true)
    setRecording(true)

    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([ await createMp4({ fps, audio, canvas, onProgress: setProgress }) ]))
    a.download = audio.name.replace(/(\.[^.]*)?$/, '.mp4')
    a.click()
    setTimeout(URL.revokeObjectURL, 0, a.href)
    setRecording(false)
  }

  _openedMenu = openedMenu
  _setOpenedMenu = setOpenedMenu

  return (
    <main className='h-full flex flex-col overflow-hidden'>
      <header className='flex relative z-10 h-10 p-2 border-b border-slate-800'>
        <div className='w-16 h-6 pr-2 font-semibold'>Dutypo</div>
        <ul className='flex items-center'>
          <Menu id='menu-file' name='파일 (F)'>
            <ButtonsDiv>
              <MenuLink href='/' kbd='Ctrl+N' onClick={() => setOpenedMenu(void 0)}>새로 만들기</MenuLink>
              <MenuButton onClick={() => {}} kbd='Ctrl+O'>작품 불러오기</MenuButton>
              <MenuButton onClick={() => {}} kbd='Ctrl+S'>작품 저장하기</MenuButton>
              <MenuButton onClick={exportToEntryProject} kbd='Ctrl+E'>작품 내보내기</MenuButton>
              <MenuButton onClick={exportToMp4} kbd='Ctrl+M'>mp4 내보내기</MenuButton>
            </ButtonsDiv>
          </Menu>
          <Menu id='menu-edit' name='편집 (E)'>
            <ButtonsDiv>
              <MenuButton onClick={() => {}} kbd='Ctrl+Z'>실행 취소</MenuButton>
              <MenuButton onClick={() => {}} kbd='Ctrl+Y'>다시 실행</MenuButton>
            </ButtonsDiv>
          </Menu>
          <Menu id='menu-option' name='설정 (O)'>
            <ButtonsDiv>
              <TODO>설정창 메뉴</TODO>
            </ButtonsDiv>
          </Menu>
          <Menu id='menu-view' name='보기 (V)'>
            <ButtonsDiv>
              <TODO>보기창 메뉴</TODO>
            </ButtonsDiv>
          </Menu>
          <input type='file' ref={inputRef} />
        </ul>
      </header>
      <section className='flex-1 flex relative overflow-hidden'>
        <section className='flex flex-col' style={{
          width: `${asideWidth * 100}%`,
        }}>
          <div className='flex-1 mt-5 flex flex-col overflow-hidden'>
            <div onPointerMove={() => setHovering(true)} onPointerLeave={() => setHovering(false)} ref={videoPlayerRef} className='group aspect-video bg-black rounded-lg relative m-auto overflow-hidden flex justify-center items-center' style={{
              height: `${menuHeight * 100}%`,
              cursor: hovering ? void 0 : 'none',
              borderRadius: fullscreen ? 0 : void 0,
            }}>
              <canvas
                width={width}
                height={height}
                ref={canvasRef}
                onClick={() => setPlaying(playing => !playing)}
                onDoubleClick={() => document.fullscreenElement ? document.exitFullscreen().then(() => setFullscreen(false)) : videoPlayerRef.current?.requestFullscreen().then(() => setFullscreen(true))}
                className='w-full h-full aspect-video bg-black object-contain'
              />
              <div className='duration-200 opacity-0 absolute left-0 right-0 bottom-0 h-36 rounded-b-lg bg-linear-to-b via-black/20 to-black/80 pt-18' style={{
                opacity: hovering ? 1 : 0,
                borderRadius: fullscreen ? 0 : void 0,
              }}>
                <div className='mx-5 bg-slate-100 h-1'>
                  <div className='bg-slate-500 h-full' style={{
                    width: `${progress * 100}%`,
                  }} />
                </div>
                <div className='h-full p-6'>
                  <svg
                    onClick={() => recording || setPlaying(true)}
                    className={`float-left duration-200 hover:scale-125 ${playing ? 'hidden' : ''} ${recording ? 'cursor-not-allowed brightness-50' : 'cursor-pointer'}`}
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                  >
                    <path d='M5,3V21L21,12' fill='#ededed' />
                  </svg>
                  <svg
                    onClick={() => recording || setPlaying(false)}
                    className={`float-left duration-200 hover:scale-125 ${playing ? '' : 'hidden'} ${recording ? 'cursor-not-allowed brightness-50' : 'cursor-pointer'}`}
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                  >
                    <path d='M7,3V21M17,3V21' fill='none' stroke='#ededed' strokeWidth='4' />
                  </svg>
                  <svg
                    onClick={() => videoPlayerRef.current?.requestFullscreen().then(() => setFullscreen(true))}
                    className='float-right cursor-pointer duration-200 hover:scale-125'
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    style={{
                      display: fullscreen ? 'none' : void 0,
                    }}
                  >
                    <path d='M1,9V5A4,4 0 0,1 5,1H9M15,1H19A4,4 0 0,1 23,5V9M23,15V19A4,4 0 0,1 19,23H15M9,23H5A4,4 0 0,1 1,19V15' fill='none' stroke='#ededed' strokeWidth='2' />
                  </svg>
                  <svg
                    onClick={() => document.exitFullscreen().then(() => setFullscreen(false))}
                    className='float-right cursor-pointer duration-200 hover:scale-125'
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    style={{
                      display: fullscreen ? void 0 : 'none',
                    }}
                  >
                    <path d='M0,9H5A4,4 0 0,0 9,5V0M15,0V5A4,4 0 0,0 19,9H24M24,15H19A4,4 0 0,0 15,19V24M9,24V19A4,4 0 0,0 5,15H0' fill='none' stroke='#ededed' strokeWidth='2' />
                  </svg>
                </div>
              </div>
            </div>
            <div onMouseDown={rowResize} className='row-resize-bar h-5 flex justify-center items-center cursor-row-resize'>
              <div className='w-8 h-2 border-y-2 border-slate-600' />
            </div>
            <div className='flex-1 bg-neutral-900 overflow-hidden'><TODO>제작창 구현</TODO></div>
          </div>
        </section>
        <div onMouseDown={colResize} className='col-resize-bar w-5 flex justify-center items-center cursor-col-resize top-0 right-0 bottom-0 z-1' style={{
          position: asideWidth == 1 ? 'absolute' : void 0,
        }}>
          <div className='w-2 h-8 border-x-2 border-slate-600' />
        </div>
        <aside hidden={asideWidth == 1} className='flex-1 z-1 bg-neutral-900 overflow-hidden'><TODO>오브젝트 창 구현</TODO></aside>
      </section>
    </main>
  )
}
