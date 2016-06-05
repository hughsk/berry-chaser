const createProjectile = require('./projectile')
const createSphere = require('./sphere')
const createBox = require('./box')
const CANNON = require('cannon')
const Node = require('scene-tree')

module.exports = createTurret

function createTurret (scene, options) {
  let position = options.position || [0, 0, 0]
  let dims = options.dims || [0.75, 0.75, 9.5]
  const tower = createBox(scene, { position, mass: 0, dims })

  tower.startFiring = function () {
    tower.firing = true
    tower._fire = setInterval(function () {
      if (!tower.firing) return
      const pos = tower.body.position.clone()
      pos.z = dims[2] + 1
      const body = options.player.body
      let targetPos = body.position.clone()
      targetPos = targetPos.vadd(body.velocity)
      const direction = pos.vsub(targetPos).unit().scale(-1)
      createProjectile(scene, {
        mass: 10.00,
        position: [pos.x, pos.y, pos.z],
        direction: [direction.x, direction.y, direction.z]
      })
    }, 1000)
  }

  var sr = 2.5

  createSphere(scene, {
    mass: 0,
    position: [position[0] + sr, position[1] + sr, position[2] + 8],
    radius: sr,
    shader: scene.shaders.badguy,
    light: [3, 1, 2]
  })

  tower.orbPosition = new CANNON.Vec3(position[0], position[1], position[2] + 7 - sr)
  tower.stopFiring = function () {
    tower.firing = false
    clearInterval(tower._fire)
  }

  setTimeout(function () {
    tower.stopFiring()
  }, 5000)

  return tower
}

function isNum (num) {
  return !Number.isNaN(num) && typeof num === 'number'
}
