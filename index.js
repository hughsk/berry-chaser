const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = require('canvas-orbit-camera')(canvas)
const gl = require('gl-context')(canvas, tick)
const Fit = require('canvas-fit')
const CANNON = require('cannon')
const eye = require('eye-vector')

const TIME_STEP = 1.0 / 60.0 // seconds
const MAX_SUB_STEPS = 1
const GRAVITY = -9.82 * 3
const TERRAIN_SHAPE = [96, 96]
const TERRAIN_SHAPE_MINUS_ONE = [TERRAIN_SHAPE[0] - 1, TERRAIN_SHAPE[1] - 1]

const Node = require('scene-tree')
const scene = Node()
const shaders = scene.shaders = require('./shaders/index')(gl)
const geoms = scene.geoms = require('./geoms/index')(gl)

const qrx = require('gl-quat/rotateX')
const qry = require('gl-quat/rotateY')
const qrz = require('gl-quat/rotateZ')
const perspective = require('gl-mat4/perspective')
const PlayerControls = require('./player-controls')
const createTurret = require('./entities/turret')
const createWater = require('./entities/water')
const createBox = require('./entities/box')
const createBoundary = require('./entities/boundary')
const createTerrain = require('./entities/terrain')
const proj = new Float32Array(16)
const view = new Float32Array(16)
const eyev = new Float32Array(3)
const lightCols = []
const lightPoss = []
const WATER_HEIGHT = 3.5

scene.gl = gl

const getNodeList = scene.list(require('./node-sorter'))

window.addEventListener('resize', Fit(canvas), false)

let world = null
let playerControls = null

let mobs = []
let tower = null

/**
 * Game Init
 */

function start () {
  world = createWorld()
  window.world = world

  playerControls = new PlayerControls(world)

  world.addBody(new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane()
  }))

  const playerModel = createSphere(scene, {
    position: [0, 0, 20],
    mass: 0.3,
    light: [1.2, 0.8, 0.4]
  })

  playerControls.control(playerModel)

  const t1 = createTurret(scene, { player: playerModel, position: [10, 10, 10] })
  const t2 = createTurret(scene, { player: playerModel, position: [-10, -10, 10] })
  tower = t1
  //t1.startFiring()
  //t2.startFiring()

  createTerrain(scene, {
    shape: TERRAIN_SHAPE
  })

  createWater(scene, {
    scale: TERRAIN_SHAPE_MINUS_ONE[0],
    position: [0, 0, WATER_HEIGHT]
  })

  createBoundary(scene, {
    shape: TERRAIN_SHAPE
  })

  for (var i = 0; i < 20; i++) {
    mobs.push(createSphere(scene, {
      radius: 0.2,
      position: [10 + i % 5, 10 + i - i % 5, 15],
      mass: 0.5
    }))
  }

  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane()
  })
  world.addBody(body)
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
  mobTick()
  camera.center[0] = playerControls.player.body.position.x
  camera.center[1] = playerControls.player.body.position.y
  camera.center[2] = playerControls.player.body.position.z
  camera.tick()
  camera.view(view)
  eye(view, eyev)

  perspective(proj, Math.PI / 4, width / height, 0.1, 300)

  world.step(1 / 120)
  world.step(1 / 120)

  const nodes = getNodeList()

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var body = node.data.body
    if (!body) continue

    if (body.mass && body.position.z < WATER_HEIGHT + 0.1) {
      body.applyForce(new CANNON.Vec3(0, 0, -GRAVITY), body.position)
    }

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
  gl.clearColor(0.09, 0.05, 0.15, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  const nodes = getNodeList()
  var currShad = null
  var currGeom = null

  lightCols.length = 0
  lightPoss.length = 0

  for (let i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (node.data.light) {
      lightCols.push(node.data.light)
      lightPoss.push(node.data.position)
    }
  }

  while (lightCols.length < 2) lightCols.push([0, 0, 0])
  while (lightPoss.length < 2) lightPoss.push([0, 0, 0])

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
      shad.uniforms.viewPos = eyev
      shad.uniforms.lightCol = lightCols
      shad.uniforms.lightPos = lightPoss
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
  world.gravity = new CANNON.Vec3(0, 0, GRAVITY)
  world.broadphase = new CANNON.NaiveBroadphase()

  const solver = new CANNON.GSSolver()
  solver.iterations = 3
  solver.tolerance = 0.0001

  world.solver = solver
  world.quatNormalizeFast = true
  world.quatNormalizeSkip = 4
  world.broadphase.useBoundingBoxes = true

  world.defaultContactMaterial.friction = 0.9
  world.defaultContactMaterial.restitution = 0.0

  const k = 1e9
  const d = 3
  world.defaultContactMaterial.contactEquationStiffness = k
  world.defaultContactMaterial.frictionEquationStiffness = k
  world.defaultContactMaterial.contactEquationRelaxation = d
  world.defaultContactMaterial.frictionEquationRelaxation = d
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
    angularDamping: 0.5,
    linearDamping: 0.8,
    mass: !isNum(options.mass) ? 1 : options.mass,
    position: new CANNON.Vec3(position[0], position[1], position[2]),
    shape: new CANNON.Sphere(options.radius)
  })

  const node = {
    geom: geoms.sphere,
    shader: shaders.sphere,
    scale: options.radius,
    body: body,
    position: position,
    light: options.light
  }

  world.addBody(node.body)
  scene.add(Node(node))

  return node
}

const MOB_SIGHT = 10
const MAX_VELOCITY = 3
const MOB_SPEED = 10
const MOB_SPACE = 1

function mobTick () {
  const playerBody = playerControls.player.body
  mobs.forEach(mob => {
    const body = mob.body
    if (body.position.distanceTo(playerBody.position) < MOB_SIGHT) {
      mob.target = playerBody.position
    } else {
      mob.target = tower.body.position
    }

    if (mob.target) {
      const direction = mob.target.clone().vsub(body.position).unit()
      body.applyForce(direction.scale(MOB_SPEED), body.position)
    }

    const verticalVelocity = body.velocity.z
    body.velocity.scale(1, 1, 0)
    body.velocity = body.velocity.unit().scale(Math.min(Math.abs(body.velocity.length()), MAX_VELOCITY))
    body.velocity.z = verticalVelocity
  })
}
