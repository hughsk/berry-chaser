precision mediump float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;
uniform mat3 normalMatrix;

varying vec3 vnorm;
varying vec3 vpos;

void main() {
  vnorm = normalize(normalMatrix * normal);
  vpos = (model * vec4(position, 1)).xyz;
  gl_Position = proj * view * model * vec4(position, 1);
}
