import * as THREE from 'three'

export default class Renderer {
  private scene
  private camera
  private renderer
  private cubeMesh

  constructor(public readonly canvas: HTMLCanvasElement) {
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

  async render(time: number) {
    const { scene, camera, renderer, cubeMesh } = this
    cubeMesh.rotation.x = time
    cubeMesh.rotation.y = time
    renderer.render(scene, camera)
  }
}
