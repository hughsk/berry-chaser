const canvas = document.body.appendChild(document.createElement('canvas'))
const gl = require('gl-context')(canvas, render)
const camera = require('canvas-orbit-camera')(canvas)
const Fit = require('canvas-fit')

const perspective = require('gl-mat4/perspective')
const shaders = require('./shaders/index')(gl)
const geoms = require('./geoms/index')(gl)
const Node = require('scene-tree')
const scene = Node()
const proj = new Float32Array(16)
const view = new Float32Array(16)

const getNodeList = scene.list(require('./node-sorter'))

scene.add(
  Node({ geom: geoms.sphere, shader: shaders.sphere }),
  Node({ geom: geoms.sphere, shader: shaders.sphere }),
  Node({ geom: geoms.sphere, shader: shaders.sphere }),
  Node({ geom: geoms.sphere, shader: shaders.sphere })
)

function render () {
  const width = canvas.width
  const height = canvas.height

  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  camera.tick()
  camera.view(view)
  perspective(proj, Math.PI / 4, width / height, 0.1, 100)

  const nodes = getNodeList()
  var currShad = null
  var currGeom = null

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var data = node.data
    var geom = data.geom
    var shad = data.shader

    if (currGeom !== geom) {
      currGeom = geom
      geom.bind()
    }
    if (currShad !== shad) {
      currShad = shad
      shad.bind()
      shad.uniforms.proj = proj
      shad.uniforms.view = view
    }

    shad.uniforms.model = node.modelMatrix
    geom.draw()
  }
}

window.addEventListener('resize', Fit(canvas), false)
