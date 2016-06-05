precision mediump float;

#define LIGHT_COUNT 2
uniform vec3 lightPos[LIGHT_COUNT];
uniform vec3 lightCol[LIGHT_COUNT];

varying vec3 vnorm;

void main() {
  float mag = max(0.0, dot(normalize(vec3(0.3, -0.5, 1)), vnorm));
  vec3 color = vec3(1.2, 0.8, 0.4) * mag;
  gl_FragColor = vec4(color, 1);
}
