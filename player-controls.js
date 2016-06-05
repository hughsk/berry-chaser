const pressed = require('key-pressed')
const CANNON = require('cannon')

const GRAVITY = -9.82 * 3
const CONTROL_FORCE = 30
const AIR_CONTROL = 0.3
const MAX_VELOCITY = 5
const JUMP_RANGE = 0.25
const JUMP_TIMEOUT = 500
const JUMP_FORCE = -1 * GRAVITY * 0.1

module.exports = class PlayerControls {
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
