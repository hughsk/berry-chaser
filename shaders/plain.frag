precision mediump float;

varying vec3 vnorm;
varying vec3 vpos;

#pragma glslify: applyFog = require('./_fog')
#pragma glslify: applyLight = require('./_light')

void main() {
  float mag = max(0.0, dot(normalize(vec3(0.3, -0.5, 1)), vnorm));
  float d = gl_FragCoord.z / gl_FragCoord.w;

  gl_FragColor = vec4(applyFog(applyLight(vec3(1), vpos, vnorm), d), 1);
}
