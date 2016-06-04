const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = require('canvas-orbit-camera')(canvas)
const gl = require('gl-context')(canvas, tick)
const Fit = require('canvas-fit')
const CANNON = require('cannon')

const TIME_STEP = 1.0 / 60.0 // seconds
const MAX_SUB_STEPS = 1

const perspective = require('gl-mat4/perspective')
const shaders = require('./shaders/index')(gl)
const geoms = require('./geoms/index')(gl)
const Node = require('scene-tree')
const scene = Node()
const proj = new Float32Array(16)
const view = new Float32Array(16)
const lights = []

const getNodeList = scene.list(require('./node-sorter'))

const world = new CANNON.World()
world.gravity = new CANNON.Vec3(0, -9.82, 0)

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

createSphere()

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

  scene.each(function (node) {
    node.setPosition(Math.random(), Math.random(), Math.random())
  })

  world.step(1 / 60)
  console.log(b.position)
  scene.tick()
}

function render () {
  const width = canvas.width
  const height = canvas.height

  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

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
    geom.draw()
  }
}

window.addEventListener('resize', Fit(canvas), false)
