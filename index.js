const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = require('canvas-orbit-camera')(canvas)
const gl = require('gl-context')(canvas, tick)
const Fit = require('canvas-fit')
const CANNON = require('cannon')

const TIME_STEP = 1.0 / 60.0 // seconds
const MAX_SUB_STEPS = 1

const qrx = require('gl-quat/rotateX')
const qry = require('gl-quat/rotateY')
const qrz = require('gl-quat/rotateZ')
const perspective = require('gl-mat4/perspective')
const shaders = require('./shaders/index')(gl)
const geoms = require('./geoms/index')(gl)
const Node = require('scene-tree')
const scene = Node()
const proj = new Float32Array(16)
const view = new Float32Array(16)
const lights = []

// qrx(camera.rotation, camera.rotation, -Math.PI / 4)

const getNodeList = scene.list(require('./node-sorter'))

const world = new CANNON.World()
// world.gravity = new CANNON.Vec3(0, -9.82, 0)
world.gravity.z = -9.82
window.world = world

function createSphere (options = {}) {
  const position = options.position || [0, 0, 0]
  const body = new CANNON.Body({
    mass: options.mass == undefined ? 1 : options.mass,
    position: new CANNON.Vec3(position[0], position[1], position[2]),
    shape: new CANNON.Sphere(options.radius || 1)
  })
  window.b = body

  const node = {
    geom: geoms.sphere,
    shader: shaders.sphere,
    scale: options.radius,
    body: body,
    position: position
  }

  world.addBody(node.body)
  scene.add(Node(node))

  return node
}

scene.add(Node({ light: [1, 0, 0] }))

world.addBody(new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane()
}))

createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 11] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 12] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 13] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 10] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 14] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 15] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 16] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 17] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 18] })
createSphere({ position: [0.01 * Math.random(), 0.01 * Math.random(), 19] })

function tick () {
  step()
  render()
}

function step () {
  const width = canvas.width
  const height = canvas.height

  camera.tick()
  camera.view(view)
  perspective(proj, Math.PI / 4, width / height, 0.1, 100)

  world.step(1 / 60)

  const nodes = getNodeList()

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var body = node.data.body
    if (!body) continue

    node.setRotation(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    )
    node.setPosition(
      body.position.x,
      body.position.y,
      body.position.z
    )
  }

  scene.tick()
}

function render () {
  const width = canvas.width
  const height = canvas.height

  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  const nodes = getNodeList()
  var currShad = null
  var currGeom = null

  lights.length = 0

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (node.data.light) lights.push(node.data.light)
  }

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var data = node.data
    var geom = data.geom
    var shad = data.shader

    if (!geom) continue
    if (!shad) continue

    if (currGeom !== geom) {
      currGeom = geom
      geom.bind()
    }
    if (currShad !== shad) {
      currShad = shad
      shad.bind()
      shad.uniforms.proj = proj
      shad.uniforms.view = view
      shad.uniforms.lights = lights
    }

    shad.uniforms.model = node.modelMatrix
    shad.uniforms.normalMatrix = node.normalMatrix
    geom.draw()
  }
}

window.addEventListener('resize', Fit(canvas), false)
