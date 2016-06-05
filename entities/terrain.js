const simplex = new (require('simplex-noise'))
const faceNormals = require('face-normals')
const Plane = require('primitive-plane')
const unindex = require('unindex-mesh')
const Geom = require('gl-geometry')
const shortid = require('shortid')
const Node = require('scene-tree')
const CANNON = require('cannon')

module.exports = function createTerrain (scene, options = {}) {
  let data = []
  const w = options.shape[0]
  const h = options.shape[1]
  const plane = Plane(w - 1, h - 1, w - 1, h - 1)

  for (var x = 0; x < w; x++) {
    var row = []
    for (var y = 0; y < h; y++) {
      var height = 0

      //height += (1 + simplex.noise2D(x * 0.03, y * 0.03)) * 5.2
      //height += (1 + simplex.noise2D(x * 0.1, y * 0.1)) * 1.75
      //height += (1 + simplex.noise2D(x * 3.1, y * 3.1)) * 0.2

      // height += 2 + Math.sin(x) // works
      height += 2 + Math.sin(y) // not works
      row.push(height)
    }
    data.push(row)
  }

  for (var i = 0; i < plane.uvs.length; i++) {
    var u = plane.uvs[i]
    var p = plane.positions[i]
    var x = Math.min(w - 1, Math.floor(u[0] * w))
    var y = Math.min(h - 1, Math.floor(u[1] * h))

    p[0] += (w - 1) / 2
    p[1] += 2.5 + (h - 1) / 2
    p[2] = data[x][y]
  }

  for (var i = 1; i < plane.cells.length; i += 2) {
    var c = plane.cells[i]
    var u = c[0]
    var v = c[1]
    c[0] = v
    c[1] = u
  }

  // Create the heightfield
  const hfShape = new CANNON.Heightfield(data, {
    elementSize: 1
  })
  const hfBody = new CANNON.Body({ mass: 0 })
  hfBody.addShape(hfShape)
  hfBody.position.set(-w/2, -h/2, 0)
  world.addBody(hfBody)
  const n = Node({
    geom: createGeom(scene.gl, plane),
    shader: scene.shaders.plain,
    body: hfBody
  })
  scene.add(n)
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
