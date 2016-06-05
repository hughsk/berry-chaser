precision mediump float;

#define LIGHT_COUNT 2
uniform vec3 lightPos[LIGHT_COUNT];
uniform vec3 lightCol[LIGHT_COUNT];

varying vec3 vnorm;

#pragma glslify: applyFog = require('./_fog')

void main() {
  float mag = 2.0 * max(0.2, 0.2 + dot(normalize(vec3(0.3, -0.5, 1)), vnorm));
  float d = gl_FragCoord.z / gl_FragCoord.w;

  gl_FragColor = vec4(applyFog(vec3(1.2, 0.8, 0.4) * mag, d), 1);
}
