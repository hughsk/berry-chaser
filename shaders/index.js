const Shader = require('gl-shader')
const glslify = require('glslify')
const shortid = require('shortid')

module.exports = function (gl) {
  return {
    sphere: createShader(gl
      , glslify('./sphere.vert')
      , glslify('./sphere.frag')
    )
  }
}

function createShader (gl, vert, frag) {
  const shader = rid(Shader(gl, vert, frag))

  shader.bind()
  if (shader.attributes.position) {
    shader.attributes.position.location = 0
  }
  if (shader.attributes.normal) {
    shader.attributes.normal.location = 1
  }

  return shader
}

function rid (value) {
  value.id = shortid.generate()
  return value
}
