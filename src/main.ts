import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

type EmotionId = 'neutral' | 'calm' | 'anxiety' | 'irritation'

const EMOTION_CAMERA: Record<
  EmotionId,
  { position: THREE.Vector3Tuple; fog: number; bg: number }
> = {
  neutral: {
    position: [8.5, 6.2, 10],
    fog: 0x0f1118,
    bg: 0x0f1118,
  },
  calm: {
    position: [6, 11, 15],
    fog: 0x101820,
    bg: 0x101820,
  },
  anxiety: {
    position: [4.2, 3.4, 5.5],
    fog: 0x180f14,
    bg: 0x160e12,
  },
  irritation: {
    position: [12, 4.5, -4],
    fog: 0x181410,
    bg: 0x161210,
  },
}

function main() {
  const wrap = document.getElementById('canvas-wrap')
  if (!wrap) return

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(EMOTION_CAMERA.neutral.fog, 0.035)

  const camera = new THREE.PerspectiveCamera(
    50,
    wrap.clientWidth / wrap.clientHeight,
    0.1,
    200
  )
  camera.position.set(...EMOTION_CAMERA.neutral.position)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(wrap.clientWidth, wrap.clientHeight)
  renderer.setClearColor(EMOTION_CAMERA.neutral.bg, 1)
  wrap.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.target.set(0, 0, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  const dir = new THREE.DirectionalLight(0xffffff, 0.85)
  dir.position.set(6, 12, 8)
  scene.add(dir)

  const axisLen = 6
  const axes = new THREE.AxesHelper(axisLen)
  axes.setColors(
    new THREE.Color(0xf97316),
    new THREE.Color(0x22c55e),
    new THREE.Color(0x3b82f6)
  )
  scene.add(axes)

  const grid = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b)
  grid.position.y = -0.01
  scene.add(grid)

  const planeSize = 12

  const matXY = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const planeXY = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), matXY)
  planeXY.position.z = 0
  scene.add(planeXY)

  const matXZ = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const planeXZ = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), matXZ)
  planeXZ.rotation.x = -Math.PI / 2
  planeXZ.position.y = 0
  scene.add(planeXZ)

  const matYZ = new THREE.MeshBasicMaterial({
    color: 0xa78bfa,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const planeYZ = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), matYZ)
  planeYZ.rotation.y = Math.PI / 2
  planeYZ.position.x = 0
  scene.add(planeYZ)

  const sphereGeom = new THREE.SphereGeometry(0.22, 28, 28)
  const mainMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.2,
    roughness: 0.35,
    emissive: 0x1e293b,
    emissiveIntensity: 0.25,
  })
  const mainPoint = new THREE.Mesh(sphereGeom, mainMat)
  scene.add(mainPoint)

  const projMatTv = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.15,
    roughness: 0.5,
    emissive: 0x78350f,
    emissiveIntensity: 0.2,
  })
  const projMatTq = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    metalness: 0.15,
    roughness: 0.5,
    emissive: 0x164e63,
    emissiveIntensity: 0.2,
  })
  const projMatVq = new THREE.MeshStandardMaterial({
    color: 0xa78bfa,
    metalness: 0.15,
    roughness: 0.5,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.2,
  })

  const projTv = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), projMatTv)
  const projTq = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), projMatTq)
  const projVq = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), projMatVq)
  scene.add(projTv, projTq, projVq)

  function makeDash(from: THREE.Vector3, to: THREE.Vector3, color: number) {
    const g = new THREE.BufferGeometry().setFromPoints([from, to])
    const m = new THREE.LineDashedMaterial({
      color,
      dashSize: 0.18,
      gapSize: 0.12,
      transparent: true,
      opacity: 0.55,
    })
    const line = new THREE.Line(g, m)
    line.computeLineDistances()
    return line
  }

  const dashGroup = new THREE.Group()
  scene.add(dashGroup)

  const slT = document.getElementById('sl-t') as HTMLInputElement
  const slV = document.getElementById('sl-v') as HTMLInputElement
  const slQ = document.getElementById('sl-q') as HTMLInputElement
  const outT = document.getElementById('out-t')!
  const outV = document.getElementById('out-v')!
  const outQ = document.getElementById('out-q')!

  function readState() {
    return {
      t: parseFloat(slT.value),
      v: parseFloat(slV.value),
      q: parseFloat(slQ.value),
    }
  }

  function updateGeometry() {
    const { t, v, q } = readState()
    outT.textContent = t.toFixed(1)
    outV.textContent = v.toFixed(1)
    outQ.textContent = q.toFixed(1)

    mainPoint.position.set(t, v, q)

    const pTv = new THREE.Vector3(t, v, 0)
    const pTq = new THREE.Vector3(t, 0, q)
    const pVq = new THREE.Vector3(0, v, q)
    projTv.position.copy(pTv)
    projTq.position.copy(pTq)
    projVq.position.copy(pVq)

    const pMain = new THREE.Vector3(t, v, q)
    dashGroup.clear()
    dashGroup.add(makeDash(pMain, pTv, 0xf59e0b))
    dashGroup.add(makeDash(pMain, pTq, 0x22d3ee))
    dashGroup.add(makeDash(pMain, pVq, 0xa78bfa))
  }

  slT.addEventListener('input', updateGeometry)
  slV.addEventListener('input', updateGeometry)
  slQ.addEventListener('input', updateGeometry)

  function applyEmotion(id: EmotionId) {
    const cfg = EMOTION_CAMERA[id]
    camera.position.set(...cfg.position)
    controls.update()
    renderer.setClearColor(cfg.bg, 1)
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.setHex(cfg.fog)
    }
  }

  document.querySelectorAll<HTMLButtonElement>('.emotion').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emotion').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      const id = btn.dataset.emotion as EmotionId
      applyEmotion(id)
    })
  })

  function onResize() {
    if (!wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  updateGeometry()
  applyEmotion('neutral')

  function tick() {
    requestAnimationFrame(tick)
    controls.update()
    renderer.render(scene, camera)
  }
  tick()
}

main()
