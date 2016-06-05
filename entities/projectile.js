const CANNON = require('cannon')
const Node = require('scene-tree')

module.exports = createProjectile

function createProjectile (scene, options = {}) {
  const position = options.position || [0, 0, 0]
  const dims = options.dims || [0.5, 0.5, 0.5]
  position[0] = position[0] - 0.5 * dims[0]
  position[1] = position[1] - 0.5 * dims[1]
  position[2] = position[2] - 0.5 * dims[2]

  const body = new CANNON.Body({
    mass: !isNum(options.mass) ? 0.5 : options.mass,
    position: new CANNON.Vec3(position[0], position[1], position[2]),
    shape: new CANNON.Box(new CANNON.Vec3(dims[0] * 0.5, dims[1] * 0.5, dims[2] * 0.5))
  })

  const d = options.direction || [0, 0, 0]

  const direction = new CANNON.Vec3(d[0], d[1], d[2])
  const velocity = options.velocity || 25
  direction[2] = direction.z + 0.3
  body.velocity = direction.unit().scale(velocity)
  body.angularVelocity.set(Math.random(), Math.random(), Math.random()).scale(2)

  const node = {
    geom: scene.geoms.box,
    shader: scene.shaders.projectile,
    scale: dims,
    body: body,
    position: position
  }

  world.addBody(node.body)
  scene.add(Node(node))

  return node
}

function isNum (num) {
  return !Number.isNaN(num) && typeof num === 'number'
}
