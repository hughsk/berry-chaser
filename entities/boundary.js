const Node = require('scene-tree')
const CANNON = require('cannon')

module.exports = function (scene, options = {}) {
  const boundary = Node()
  const boundaries = createBoundaries(options).map(b => {
    return Node({
      body: b
    })
  })

  boundary.add(...boundaries)
  scene.add(boundary)

  boundaries.forEach(({data}) => window.world.addBody(data.body))
  return boundaries
}

function createBoundaries (options = {}) {
  const shape = options.shape || [50, 50]
  const w = shape[0]
  const h = shape[1]
  const N = createWall()
  N.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
  N.position.y = h * 0.5

  const S = createWall()
  S.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -1 * Math.PI / 2)
  S.position.y = h * -0.5

  const E = createWall()
  E.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
  E.position.x = w * -0.5

  const W = createWall()
  W.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1 * Math.PI / 2)
  W.position.x = w * 0.5

  return [
    N,
    S,
    E,
    W
  ]
}

function createWall () {
  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane()
  })
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
  return body
}
