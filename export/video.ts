import Tar from 'tar-js'
import generateHash from './hash'
import createVideoProject from './entry'
import * as THREE from 'three'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { Muxer, MuxerOptions, ArrayBufferTarget } from 'mp4-muxer'

class Renderer {
  public readonly canvas
  private scene
  private camera
  private renderer
  private cubeMesh

  constructor(config: RenderOptions) {
    const canvas = this.canvas = config.video.canvas
    const scene = this.scene = new THREE.Scene
    const camera = this.camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height)
    camera.position.z = 5
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
    const cube = new THREE.BoxGeometry
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0080 })
    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(1, 1, 5).normalize()
    scene.add(this.cubeMesh = new THREE.Mesh(cube, cubeMaterial), light)
  }

  async renderFrame(time: number) {
    const { scene, camera, renderer, cubeMesh } = this
    cubeMesh.rotation.x = time
    cubeMesh.rotation.y = time
    renderer.render(scene, camera)
  }

  async renderAudio(time: number, duration: number, options: BaseAudioOptions) {
    const numberOfFrames = Math.min(options.numberOfFrames, Math.ceil((duration - time) * options.sampleRate))
    return new AudioData({
      data: new Float32Array(numberOfFrames * options.numberOfChannels),
      format: options.format,
      numberOfChannels: options.numberOfChannels,
      numberOfFrames,
      sampleRate: options.sampleRate,
      timestamp: time * 1_000_000,
    })
  }
}

interface BaseVideoOptions {
  canvas: HTMLCanvasElement
  framerate: number
}

interface BaseAudioOptions {
  numberOfFrames: number
  numberOfChannels: number
  sampleRate: number
  format: AudioSampleFormat
}

interface RenderOptions {
  name: string
  duration: number
  video: BaseVideoOptions
  audio: BaseAudioOptions
  onVideoRendered?(frame: HTMLCanvasElement, frameNo: number): Promise<void>
  onAudioRendered?(data: AudioData, frameNo: number): Promise<void>
}

async function render(options: RenderOptions) {
  const renderer = new Renderer(options)
  await Promise.all([
    (async () => {
      for (let frame = 0; frame < options.duration * options.video.framerate; frame++) {
        await renderer.renderFrame(frame / options.video.framerate)
        await options.onVideoRendered?.(options.video.canvas, frame)
      }
    })(),
    (async () => {
      for (let frame = 0; frame < options.duration * options.audio.sampleRate; ) {
        const audioData = await renderer.renderAudio(frame / options.audio.sampleRate, options.duration, options.audio)
        await options.onAudioRendered?.(audioData, frame)
        frame += audioData.numberOfFrames
      }
    })(),
  ])
}

type VideoCodec = (MuxerOptions<ArrayBufferTarget>['video'] extends infer T | undefined ? T : unknown)['codec']
type AudioCodec = (MuxerOptions<ArrayBufferTarget>['audio'] extends infer T | undefined ? T : unknown)['codec']

export interface AudioOptions extends BaseAudioOptions, Omit<AudioEncoderConfig, 'codec'> {
  codecType: AudioCodec
  codecString: string
}

export interface VideoOptions extends BaseVideoOptions, Omit<VideoEncoderConfig, 'codec' | 'framerate' | 'width' | 'height'> {
  codecType: VideoCodec
  codecString: string
  rotation?: (MuxerOptions<ArrayBufferTarget>['video'] extends infer T | undefined ? T : unknown)['rotation']
}

export interface EntryRenderOptions extends RenderOptions {
  useDummyCode?: boolean
  audio: AudioOptions
}

export interface Mp4RenderOptions extends RenderOptions {
  video: VideoOptions
  audio: AudioOptions
  fastStart: MuxerOptions<ArrayBufferTarget>['fastStart']
  minFragmentDuration: MuxerOptions<ArrayBufferTarget>['minFragmentDuration']
  firstTimestampBehavior: MuxerOptions<ArrayBufferTarget>['firstTimestampBehavior']
}

export async function renderEntryProject(options: EntryRenderOptions) {
  const tar = new Tar
  const audioHash = generateHash()
  const pictures: string[] = []
  const promises: Promise<unknown>[] = []

  const audioMuxer = new Muxer({
    target: new ArrayBufferTarget,
    audio: {
      codec: options.audio.codecType,
      sampleRate: options.audio.sampleRate,
      numberOfChannels: options.audio.numberOfChannels,
    },
    fastStart: false,
  })
  const audioEncoder = new AudioEncoder({
    error(error) { throw error },
    output: audioMuxer.addAudioChunk.bind(audioMuxer),
  })
  audioEncoder.configure({
    ...options.audio,
    codec: options.audio.codecString,
  })

  await render({
    ...options,
    async onAudioRendered(data, frameNo) {
      await options.onAudioRendered?.(data, frameNo)

      audioEncoder.encode(data)
      data.close()
      await new Promise(resolve => audioEncoder.addEventListener('dequeue', resolve))
    },
    async onVideoRendered(frame, frameNo) {
      await options.onVideoRendered?.(frame, frameNo)

      return new Promise(resolve => promises[frameNo] = (async () => {
        const blob = await new Promise<Blob | null>(resolve => frame.toBlob(resolve))
        if (!blob) throw new TypeError('Failed to get blob from canvas.')
        queueMicrotask(resolve)
        const data = await blob.arrayBuffer()

        const hash = generateHash()
        pictures[frameNo] = hash
        tar.append(`temp/${hash.substring(0, 2)}/${hash.substring(2, 4)}/image/${hash}.png`, new Uint8Array(data))
      })())
    },
  })
  await audioEncoder.flush()
  audioEncoder.close()
  audioMuxer.finalize()

  const ffmpeg = new FFmpeg
  await ffmpeg.load()
  await ffmpeg.writeFile('a.mp4', new Uint8Array(audioMuxer.target.buffer))
  await ffmpeg.exec(['-i', 'a.mp4', 'a.mp3'])
  tar.append(`temp/${audioHash.substring(0, 2)}/${audioHash.substring(2, 4)}/${audioHash}.mp3`, await ffmpeg.readFile('a.mp3'))

  await Promise.all(promises)
  return tar.append('temp/project.json', new TextEncoder().encode(JSON.stringify(createVideoProject({
    name: options.name,
    width: options.video.canvas.width,
    height: options.video.canvas.height,
    pictures,
    duration: options.duration,
    fps: options.video.framerate,
    frames: Math.ceil(options.duration * options.video.framerate),
    audioHash,
    useDummyCode: options.useDummyCode,
  }))))
}

export async function renderMp4(options: Mp4RenderOptions) {
  const muxer = new Muxer({
    target: new ArrayBufferTarget,
    video: {
      codec: options.video.codecType,
      width: options.video.canvas.width,
      height: options.video.canvas.height,
      frameRate: options.video.framerate,
      rotation: options.video.rotation,
    },
    audio: {
      codec: options.audio.codecType,
      numberOfChannels: options.audio.numberOfChannels,
      sampleRate: options.audio.sampleRate,
    },
    fastStart: options.fastStart,
    minFragmentDuration: options.minFragmentDuration,
    firstTimestampBehavior: options.firstTimestampBehavior,
  })

  const videoEncoder = new VideoEncoder({
    error(error) { throw error },
    output: muxer.addVideoChunk.bind(muxer),
  })
  videoEncoder.configure({
    ...options.video,
    codec: options.video.codecString,
    width: options.video.canvas.width,
    height: options.video.canvas.height,
  })

  const audioEncoder = new AudioEncoder({
    error(error) { throw error },
    output: muxer.addAudioChunk.bind(muxer),
  })
  audioEncoder.configure({
    ...options.audio,
    codec: options.audio.codecString,
  })

  await render({
    ...options,
    async onAudioRendered(data, frameNo) {
      await options.onAudioRendered?.(data, frameNo)

      audioEncoder.encode(data)
      data.close()
      await new Promise(resolve => audioEncoder.addEventListener('dequeue', resolve))
    },
    async onVideoRendered(frame, frameNo) {
      await options.onVideoRendered?.(frame, frameNo)

      const videoFrame = new VideoFrame(frame, { timestamp: frameNo * 1_000_000 / options.video.framerate })
      videoEncoder.encode(videoFrame)
      videoFrame.close()
    },
  })
  await Promise.all([
    videoEncoder.flush(),
    audioEncoder.flush(),
  ])
  videoEncoder.close()
  audioEncoder.close()
  muxer.finalize()

  return new Uint8Array(muxer.target.buffer)
}
