const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = require('canvas-orbit-camera')(canvas)
const gl = require('gl-context')(canvas, tick)
const Fit = require('canvas-fit')
const CANNON = require('cannon')
const pressed = require('key-pressed')

const TIME_STEP = 1.0 / 60.0 // seconds
const MAX_SUB_STEPS = 1
const MAX_VELOCITY = 5
const CONTROL_FORCE = 30
const JUMP_TIMEOUT = 500
const JUMP_RANGE = 0.25
const AIR_CONTROL = 0.3
const GRAVITY = -9.82 * 3
const JUMP_FORCE = -1 * GRAVITY * 0.6

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

const world = createWorld()

window.world = world

class Game {
  constructor () {
    this.player = null
    this.jumpBlocked = false
  }

  control (node) {
    this.player = node
  }

  playerCollisions () {
    if (!this.player) return []
    const body = this.player.body
    return world.contacts.filter(evt => {
      return evt.bi === body
    })
  }

  applyControls () {
    if (!this.player) return
    const lr = pressed('<right>') - pressed('<left>')
    const ud = pressed('<up>') - pressed('<down>')
    const jump = pressed('<space>')
    if (jump) {
      if (this.jumpWasPressed) {
        this.jumpWasReleased = false
      }
      this.jumpWasPressed = true
    } else {
      if (this.jumpWasPressed) this.jumpWasReleased = true
      this.jumpWasPressed = false
    }

    const body = this.player.body

    let force = CONTROL_FORCE
    const keyPressed = lr !== 0 || ud !== 0 || jump !== 0
    if (keyPressed) {
      const c = this.playerCollisions()
      if (!c.length) {
        // we are in the air
        force *= AIR_CONTROL
      } else if (jump && this.jumpWasReleased && !this.jumpBlocked) {
        // can jump
        for (let i = 0; i < c.length; i++) {
          const collision = c[i]
          const contactBelow = collision.ni.dot(new CANNON.Vec3(0, 0, -1))
          // ensure has contact below
          if (contactBelow < 1 - JUMP_RANGE || contactBelow > 1 + JUMP_RANGE) continue
          this.jumpBlocked = true
          body.applyImpulse(new CANNON.Vec3(0, 0, JUMP_FORCE), body.position)
          setTimeout(() => {
            this.jumpBlocked = false
          }, JUMP_TIMEOUT)
          break
        }
      }
    }

    body.applyForce(new CANNON.Vec3(lr, ud, 0).mult(force), body.position)

    // set max horizontal velocity
    const verticalVelocity = body.velocity.z
    body.velocity.scale(1, 1, 0)
    body.velocity = body.velocity.unit().scale(Math.min(Math.abs(body.velocity.length()), MAX_VELOCITY))
    body.velocity.z = verticalVelocity
  }

  tick () {
    this.applyControls()
  }
}

const game = new Game()
window.game = game

function createSphere (options = {}) {
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

function createBox (options = {}) {
  const position = options.position || [0, 0, 0]
  const dims = options.dims || [1, 1, 1]
  position[0] = position[0] - 0.5 * dims[0]
  position[1] = position[1] - 0.5 * dims[1]
  position[2] = position[2] - 0.5 * dims[2]

  const body = new CANNON.Body({
    mass: !isNum(options.mass) ? 1 : options.mass,
    position: new CANNON.Vec3(position[0], position[1], position[2]),
    shape: new CANNON.Box(new CANNON.Vec3(dims[0] * 0.5, dims[1] * 0.5, dims[2] * 0.5))
  })

  const node = {
    geom: geoms.box,
    shader: shaders.sphere,
    scale: dims,
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

createBox({ position: [0, 0, 1] })
createBox({ position: [0, 1, 1] })
createBox({ position: [0, 2, 1] })
createBox({ position: [1, 3, 1], dims: [3, 1, 1] })
createBox({ position: [3, 1, 1], dims: [1, 2, 1] })
const player = createSphere({ position: [3, 3, 1] })

game.control(player)

function tick () {
  game.tick()
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

function isNum (num) {
  return !Number.isNaN(num) && typeof num === 'number'
}

function createWorld () {
  const world = new CANNON.World()
  world.quatNormalizeFast = true
  world.quatNormalizeSkip = 0
  world.broadphase.useBoundingBoxes = true
  world.gravity = new CANNON.Vec3(0, 0, GRAVITY)
  world.broadphase = new CANNON.NaiveBroadphase()
  const solver = new CANNON.GSSolver()
  solver.iterations = 2
  world.defaultContactMaterial.contactEquationRegularizationTime = 0.55
  solver.tolerance = 0.02
  world.solver = solver

  world.quatNormalizeFast = true
  world.quatNormalizeSkip = 0
  world.broadphase.useBoundingBoxes = true

  world.defaultContactMaterial.friction = 0.7
  world.defaultContactMaterial.restitution = 0.0
  world.defaultContactMaterial.contactEquationStiffness = 1e9
  world.defaultContactMaterial.contactEquationRegularizationTime = 4
  return world
}

window.addEventListener('resize', Fit(canvas), false)
