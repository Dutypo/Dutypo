import { FFmpeg } from '@ffmpeg/ffmpeg'
import Tar from 'tar-js'
import generateHash from './hash'
import Renderer from './renderer'
import createProject from './project'
import { ArrayBufferTarget, Muxer } from 'mp4-muxer'

async function render({ ffmpeg, fps, audio, canvas, terminate, onAudioLoaded, onFrameDrawn, onProgress }: {
  ffmpeg: FFmpeg
  fps: number
  audio: File
  canvas: HTMLCanvasElement
  terminate: boolean
  onAudioLoaded?(audio: Uint8Array): void
  onFrameDrawn(canvas: HTMLCanvasElement, frame: number, next: () => void): void
  onProgress?(progress: number): void
}) {
  const renderer = new Renderer(canvas)
  const [ audioData ] = await Promise.all([
    audio.arrayBuffer().then(data => {
      const audioData = new Uint8Array(data)
      onAudioLoaded?.(audioData)
      return audioData
    }),
    ffmpeg.load(),
  ])

  await ffmpeg.writeFile(audio.name, audioData)
  await ffmpeg.ffprobe(['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audio.name, '-o', 'd.txt'])
  const duration = await ffmpeg.readFile('d.txt').then(data => parseFloat(typeof data == 'object' ? new TextDecoder().decode(data) : data))
  if (terminate) ffmpeg.terminate()

  const frames = Math.ceil(duration * fps)
  let loadedFrames = 0
  for (let frame = 0; frame < frames; frame++) {
    const time = frame / fps
    await renderer.render(time)
    await new Promise<void>(resolve => onFrameDrawn(canvas, frame, resolve))
    const progress = ++loadedFrames / frames
    onProgress?.(progress)
  }
  return { duration, frames }
}

export async function createEntryProject({ fps, audio, canvas, useDummyCode, onProgress }: {
  fps: number
  audio: File
  canvas: HTMLCanvasElement
  useDummyCode: boolean
  onProgress?(progress: number): void
}) {
  // const input = inputRef.current, canvas = canvasRef.current
  // if (!input || !canvas) return
  // const audio = input.files?.[0]
  // if (!audio) return alert('오디오 파일을 선택해 주세요.')
  // setRecording(true)

  const tar = new Tar
  const ffmpeg = new FFmpeg
  const audioHash = generateHash()
  const pictures: string[] = []
  const promises: Promise<unknown>[] = []
  const { duration, frames } = await render({
    ffmpeg,
    fps,
    audio,
    canvas,
    terminate: true,
    onAudioLoaded(audio) {
      tar.append(`temp/${audioHash.substring(0, 2)}/${audioHash.substring(2, 4)}/${audioHash}.mp3`, audio)
    },
    onFrameDrawn(canvas, frame, next) {
      promises[frame] = (async () => {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve))
        queueMicrotask(next)
        if (!blob) throw new TypeError('Failed to get blob from canvas.')
        const data = await blob.arrayBuffer()

        const hash = generateHash()
        pictures[frame] = hash
        tar.append(`temp/${hash.substring(0, 2)}/${hash.substring(2, 4)}/image/${hash}.png`, new Uint8Array(data))
      })()
    },
    onProgress,
  })

  await Promise.all(promises)
  return tar.append('temp/project.json', new TextEncoder().encode(JSON.stringify(createProject({
    name: audio.name,
    width: canvas.width,
    height: canvas.height,
    pictures,
    duration,
    fps,
    frames,
    audioHash,
    useDummyCode
  }))))

  // const a = document.createElement('a')
  // a.href = URL.createObjectURL(new Blob([ tar.out ]))
  // a.download = audio.name.replace(/(\.[^.]*)?$/, '.ent')
  // a.click()
  // setTimeout(URL.revokeObjectURL, 0, a.href)
  // setRecording(false)
}

export async function createMp4({ fps, audio, canvas, onProgress }: {
  fps: number
  audio: File
  canvas: HTMLCanvasElement
  onProgress?(progress: number): void
}) {
  // const input = inputRef.current, canvas = canvasRef.current
  // if (!input || !canvas) return
  // const audio = input.files?.[0]
  // if (!audio) return alert('오디오 파일을 선택해 주세요.')
  // setWidth(canvas.width = 2560)
  // setHeight(canvas.height = 1440)
  // setRecording(true)

  const muxer = new Muxer({
    target: new ArrayBufferTarget,
    video: {
      codec: 'av1',
      width: canvas.width,
      height: canvas.height,
      frameRate: fps,
    },
    fastStart: false,
  })
  const encoder = new VideoEncoder({
    error(error) { throw error },
    output: muxer.addVideoChunk.bind(muxer),
  })
  encoder.configure({
    codec: 'av01.0.08M.08',
    width: canvas.width,
    height: canvas.height,
  })

  const offscreen = new OffscreenCanvas(canvas.width, canvas.height)
  const context = offscreen.getContext('2d')
  if (!context) throw new TypeError('Cannot use Canvas2D')
  context.fillStyle = '#fff'

  const ffmpeg = new FFmpeg
  await render({
    ffmpeg,
    fps,
    audio,
    canvas,
    terminate: false,
    onFrameDrawn(canvas, frame, next) {
      context.fillRect(0, 0, offscreen.width, offscreen.height)
      context.drawImage(canvas, 0, 0)
      const videoFrame = new VideoFrame(offscreen, { timestamp: frame * 1_000_000 / fps })
      encoder.encode(videoFrame)
      videoFrame.close()
      encoder.addEventListener('dequeue', next)
    },
    onProgress,
  })
  await encoder.flush()
  encoder.close()
  muxer.finalize()

  await ffmpeg.writeFile('v.mp4', new Uint8Array(muxer.target.buffer))
  await ffmpeg.exec(['-i', 'v.mp4', '-i', audio.name, '-c', 'copy', 'o.mp4'])

  return ffmpeg.readFile('o.mp4')
  // const a = document.createElement('a')
  // a.href = URL.createObjectURL(new Blob([ await ffmpeg.readFile('o.mp4') ]))
  // a.download = audio.name.replace(/(\.[^.]*)?$/, '.mp4')
  // a.click()
  // setTimeout(URL.revokeObjectURL, 0, a.href)
  // setRecording(false)
}
