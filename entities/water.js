const Node = require('scene-tree')

module.exports = function createWater (scene, options = {}) {
  scene.add(Node({
    position: [0, 0, -0.5],
    geom: scene.geoms.plane,
    scale: 95,
    shader: scene.shaders.water
  }))
}
