precision mediump float;

#pragma glslify: applyFog = require('./_fog')
#pragma glslify: applyLight = require('./_light')

varying vec3 vnorm;
varying vec3 vpos;

void main() {
  float d = gl_FragCoord.z / gl_FragCoord.w;
  vec3 color = vec3(1.2, 0.8, 0.4);
  gl_FragColor = vec4(applyFog(applyLight(color, vpos, vnorm), d), 1);
}
