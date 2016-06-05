const createProjectile = require('./projectile')
const createBox = require('./box')
const CANNON = require('cannon')
const Node = require('scene-tree')

module.exports = createTurret

function createTurret (scene, options) {
  let position = options.position || [0, 0, 0]
  let dims = options.dims || [1, 1, 10]
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
