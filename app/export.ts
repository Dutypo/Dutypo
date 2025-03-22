import Tar from 'tar-js'
import * as THREE from 'three'
import generateHash from './hash'

class Renderer {
  public readonly canvas
  private scene
  private camera
  private renderer
  private cubeMesh

  constructor(config: RenderOptions) {
    const canvas = this.canvas = config.canvas
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

  async renderAudio(time: number, sampleRate: number) {
    return new AudioData({
      data: new Float32Array(2),
      format: 'f32-planar',
      numberOfChannels: 2,
      numberOfFrames: 1,
      sampleRate,
      timestamp: time * 1_000_000,
    })
  }
}

interface BaseRenderOptions {
  canvas: HTMLCanvasElement
  duration: number
  fps: number
  channels: number
  sampleRate: number
}

interface RenderOptions extends BaseRenderOptions {
  onAudioRendered?(data: AudioData, frameNo: number): Promise<void>
  onVideoRendered?(frame: HTMLCanvasElement, frameNo: number): Promise<void>
}

async function render(options: RenderOptions) {
  const renderer = new Renderer(options)
  await Promise.all([
    (async () => {
      for (let frame = 0; frame < options.duration * options.fps; frame++) {
        await renderer.renderFrame(frame / options.fps)
        await options.onVideoRendered?.(options.canvas, frame)
      }
    })(),
    (async () => {
      for (let frame = 0; frame < options.duration * options.sampleRate; ) {
        const audioData = await renderer.renderAudio(frame / options.sampleRate, options.sampleRate)
        await options.onAudioRendered?.(audioData, frame)
        frame += audioData.numberOfFrames
      }
    })(),
  ])
}

export interface EntryRenderOptions extends BaseRenderOptions {
  useDummyCode: boolean
}

export async function renderEntryProject(options: EntryRenderOptions) {
  const tar = new Tar
  const audioHash = generateHash()
  const pictures: string[] = []
  const promises: Promise<unknown>[] = []

  await render({
    ...options,
    onAudioRendered(data, frameNo) {
      return Promise.resolve()
    },
    onVideoRendered(frame, frameNo) {
      return new Promise(resolve => {
        promises[frameNo] = (async () => {
          const blob = await new Promise<Blob | null>(resolve => frame.toBlob(resolve))
          queueMicrotask(resolve)
          if (!blob) throw new TypeError('Failed to get blob from canvas.')
          const data = await blob.arrayBuffer()

          const hash = generateHash()
          pictures[frameNo] = hash
          tar.append(`temp/${hash.substring(0, 2)}/${hash.substring(2, 4)}/image/${hash}.png`, new Uint8Array(data))
        })()
      })
    },
  })
}
