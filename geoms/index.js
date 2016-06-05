const faceNormals = require('face-normals')
const unindex = require('unindex-mesh')
const icosphere = require('icosphere')
const Geom = require('gl-geometry')
const shortid = require('shortid')
const Cube = require('primitive-cube')
const Plane = require('primitive-plane')

module.exports = function (gl) {
  return {
    sphere: createGeom(gl, icosphere(1)),
    box: createGeom(gl, Cube()),
    plane: createGeom(gl, ProperPlane())
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

function ProperPlane () {
  var plane = Plane(1, 1, 1, 1)

  for (var i = 1; i < plane.cells.length; i += 2) {
    var c = plane.cells[i]
    var u = c[0]
    var v = c[1]
    c[0] = v
    c[1] = u
  }

  return plane
}
