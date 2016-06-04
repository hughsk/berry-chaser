precision mediump float;

#define LIGHT_COUNT 2
uniform vec3 lightPos[LIGHT_COUNT];
uniform vec3 lightCol[LIGHT_COUNT];

varying vec3 vnorm;

void main() {
  float mag = max(0.0, dot(normalize(vec3(0, 0, 1)), vnorm));

  gl_FragColor = vec4(mag, mag, mag, 1);
}
