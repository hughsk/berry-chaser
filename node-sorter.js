module.exports = function sortByShaderAndGeometry (a, b) {
  var a_geom = a.data.geom
  var b_geom = b.data.geom
  var a_shad = a.data.shader
  var b_shad = b.data.shader

  if (!a_geom) return -1
  if (!b_geom) return +1
  if (!a_shad) return -1
  if (!b_shad) return +1

  a_geom = a_geom.id
  b_geom = b_geom.id
  a_shad = a_shad.id
  b_shad = b_shad.id

  if (a_geom !== b_geom) return (a_geom > b_geom) * 2 - 1
  if (a_shad !== b_shad) return (a_shad > b_shad) * 2 - 1

  return 0
}
