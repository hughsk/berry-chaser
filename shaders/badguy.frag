precision mediump float;

#define LIGHT_COUNT 2
uniform vec3 lightPos[LIGHT_COUNT];
uniform vec3 lightCol[LIGHT_COUNT];

varying vec3 vnorm;
varying vec3 vpos;

#pragma glslify: applyFog = require('./_fog')
#pragma glslify: applyLight = require('./_light')

void main() {
  // float mag = 0.8 * max(0.2, 0.5 + dot(normalize(vec3(0.3, -0.5, 1)), vnorm));
  float d = gl_FragCoord.z / gl_FragCoord.w;

  gl_FragColor = vec4(applyFog(applyLight(vec3(1.4, 0.4, 0.6), vpos, vnorm), d), 1);
}
