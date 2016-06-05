precision mediump float;

#define LIGHT_COUNT 2
uniform vec3 lightPos[LIGHT_COUNT];
uniform vec3 lightCol[LIGHT_COUNT];

varying vec3 vnorm;

#pragma glslify: applyFog = require('./_fog')

void main() {
  float mag = max(0.0, dot(normalize(vec3(0.3, -0.5, 1)), vnorm));
  float d = gl_FragCoord.z / gl_FragCoord.w;

  gl_FragColor = vec4(applyFog(vec3(0.4, 1.1, 0.8) * mag, d), 1);
}
