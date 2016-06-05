const CANNON = require('cannon')
const Node = require('scene-tree')

module.exports = createBox

function createBox (scene, options = {}) {
  const position = options.position || [0, 0, 0]
  const dims = options.dims || [1, 1, 1]

  position[0] = position[0] - 0.5 * dims[0]
  position[1] = position[1] - 0.5 * dims[1]
  position[2] = position[2] - 0.5 * dims[2] * -1

  const body = new CANNON.Body({
    mass: !isNum(options.mass) ? 1 : options.mass,
    position: new CANNON.Vec3(position[0], position[1], position[2]),
    shape: new CANNON.Box(new CANNON.Vec3(dims[0] * 0.5, dims[1] * 0.5, dims[2] * 0.5))
  })

  const node = {
    geom: scene.geoms.box,
    shader: scene.shaders.sphere,
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
