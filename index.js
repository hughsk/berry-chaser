const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = require('canvas-orbit-camera')(canvas)
const gl = require('gl-context')(canvas, tick)
const Fit = require('canvas-fit')
const CANNON = require('cannon')

const TIME_STEP = 1.0 / 60.0 // seconds
const MAX_SUB_STEPS = 1
const GRAVITY = -9.82 * 3

const qrx = require('gl-quat/rotateX')
const qry = require('gl-quat/rotateY')
const qrz = require('gl-quat/rotateZ')
const perspective = require('gl-mat4/perspective')
const PlayerControls = require('./player-controls')
const createTurret = require('./entities/turret')
const createBox = require('./entities/box')
const Node = require('scene-tree')
const scene = Node()
const shaders = scene.shaders = require('./shaders/index')(gl)
const geoms = scene.geoms = require('./geoms/index')(gl)
const proj = new Float32Array(16)
const view = new Float32Array(16)
const lights = []

const getNodeList = scene.list(require('./node-sorter'))

window.addEventListener('resize', Fit(canvas), false)

let world = null
let playerControls = null

/**
 * Game Init
 */

function start () {
  world = createWorld()
  window.world = world

  playerControls = new PlayerControls(world)

  scene.add(Node({ light: [1, 0, 0] }))

  world.addBody(new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane()
  }))

  const playerModel = createSphere(scene, { position: [3, 3, 1], mass: 0.3 })
  playerControls.control(playerModel)

  const t1 = createTurret(scene, { player: playerModel, position: [10, 10, 0] })
  const t2 = createTurret(scene, { player: playerModel, position: [-10, -10, 0] })

  t1.startFiring()
  t2.startFiring()
}

/**
 * Render Loop
 */

function tick () {
  if (!world) start()
  step()
  render()
}

function step () {
  const width = canvas.width
  const height = canvas.height

  playerControls.tick()
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

  for (let i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (node.data.light) lights.push(node.data.light)
  }

  for (let i = 0; i < nodes.length; i++) {
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

/**
 * Entities
 */

function createWorld () {
  const world = new CANNON.World()
  world.quatNormalizeFast = true
  world.quatNormalizeSkip = 1
  world.broadphase.useBoundingBoxes = true
  world.gravity = new CANNON.Vec3(0, 0, GRAVITY)
  world.broadphase = new CANNON.NaiveBroadphase()
  const solver = new CANNON.GSSolver()
  solver.iterations = 3
  solver.tolerance = 0.01
  world.solver = solver

  world.quatNormalizeFast = true
  world.quatNormalizeSkip = 3
  world.broadphase.useBoundingBoxes = true

  world.defaultContactMaterial.friction = 0.7
  world.defaultContactMaterial.restitution = 0.0
  world.defaultContactMaterial.contactEquationStiffness = 1e9
  world.defaultContactMaterial.contactEquationRegularizationTime = 4
  return world
}

function isNum (num) {
  return !Number.isNaN(num) && typeof num === 'number'
}

function createSphere (scene, options = {}) {
  const position = options.position || [0, 0, 0]
  options.radius = options.radius || 0.5

  position[0] = position[0] - 1 * options.radius
  position[1] = position[1] - 1 * options.radius
  position[2] = position[2] - 1 * options.radius

  const body = new CANNON.Body({
    mass: !isNum(options.mass) ? 1 : options.mass,
    position: new CANNON.Vec3(position[0], position[1], position[2]),
    shape: new CANNON.Sphere(options.radius)
  })

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
