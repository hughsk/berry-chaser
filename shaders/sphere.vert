precision mediump float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;
uniform mat4 normalMatrix;

void main() {
  gl_Position = proj * view * model * vec4(position, 1);
}
