const canvas = document.body.appendChild(document.createElement('canvas'))
const gl = require('gl-context')(canvas, render)
const Fit = require('canvas-fit')

const Geom = require('gl-geometry')
const Shader = require('gl-shader')
const Node = require('scene-tree')
const glslify = require('glslify')

function render () {
  const width = canvas.width
  const height = canvas.height

  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 1)
}

window.addEventListener('resize', Fit(canvas), false)
