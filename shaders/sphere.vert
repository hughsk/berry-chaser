precision mediump float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;
uniform mat3 normalMatrix;

varying vec3 vnorm;

void main() {
  vnorm = normalMatrix * normal;
  gl_Position = proj * view * model * vec4(position, 1);
}
