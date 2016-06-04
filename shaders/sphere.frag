precision mediump float;

#define LIGHT_COUNT 2
uniform vec3 lightPos[LIGHT_COUNT];
uniform vec3 lightCol[LIGHT_COUNT];

void main() {
  gl_FragColor = vec4(1, 0, 1, 1);
}
