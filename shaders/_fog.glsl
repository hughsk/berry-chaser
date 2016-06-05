#pragma glslify: fog = require('glsl-fog')
#pragma glslify: ease = require('glsl-easings/exponential-in')

uniform float test;

vec3 applyFog(vec3 color, float dist) {
  float t = clamp(ease(fog(dist, 0.025)), 0.0, 1.0);
  return mix(color, vec3(0.09, 0.05, 0.15), t);
}

#pragma glslify: export(applyFog)
