const Shader = require('gl-shader')
const glslify = require('glslify')
const shortid = require('shortid')

module.exports = function (gl) {
  var prefix = ``

  console.log(glslify('./plain.frag'))
  return {
    sphere: createShader(gl
      , prefix + glslify('./sphere.vert')
      , prefix + glslify('./sphere.frag')
    ),
    projectile: createShader(gl
      , prefix + glslify('./sphere.vert')
      , prefix + glslify('./projectile.frag')
    ),
    terrain: createShader(gl
      , prefix + glslify('./sphere.vert')
      , prefix + glslify('./terrain.frag')
    ),
    water: createShader(gl
      , prefix + glslify('./sphere.vert')
      , prefix + glslify('./water.frag')
    ),
    plain: createShader(gl
      , prefix + glslify('./sphere.vert')
      , prefix + glslify('./plain.frag')
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
