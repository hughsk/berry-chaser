const CANNON = require('cannon')
const Node = require('scene-tree')

module.exports = function createSphere (scene, options = {}) {
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
    geom: scene.geoms.sphere,
    shader: options.shader || scene.shaders.sphere,
    scale: options.scale || options.radius,
    body: body,
    position: position,
    light: options.light,
    size: options.size
  }

  world.addBody(node.body)
  scene.add(node.node = Node(node))

  return node
}

function isNum (num) {
  return !Number.isNaN(num) && typeof num === 'number'
}
