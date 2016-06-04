const faceNormals = require('face-normals')
const unindex = require('unindex-mesh')
const icosphere = require('icosphere')
const Geom = require('gl-geometry')
const shortid = require('shortid')
const Cube = require('primitive-cube')

module.exports = function (gl) {
  return {
    sphere: createGeom(gl, icosphere(2)),
    box: createGeom(gl, Cube())
  }
}

function createGeom (gl, complex) {
  const positions = unindex(complex)
  const normals = faceNormals(positions)

  return rid(Geom(gl))
    .attr('position', positions)
    .attr('normal', normals)
}

function rid (value) {
  value.id = shortid.generate()
  return value
}
