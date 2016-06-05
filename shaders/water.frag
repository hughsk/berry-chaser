precision mediump float;

varying vec3 vnorm;
varying vec3 vpos;

#pragma glslify: applyFog = require('./_fog')
#pragma glslify: applyLight = require('./_light')

void main() {
  float d = gl_FragCoord.z / gl_FragCoord.w;

  gl_FragColor = vec4(applyFog(applyLight(vec3(0.45, 1, 1.2), vpos, vnorm, 0.0, 0.0), d), 1);
}
