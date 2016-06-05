const Node = require('scene-tree')

module.exports = function createWater (scene, options = {}) {
  scene.add(Node({
    position: options.position || [0, 0, -0.5],
    geom: scene.geoms.plane,
    scale: options.scale || 1,
    shader: scene.shaders.water
  }))
}
