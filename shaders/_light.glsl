#define LIGHT_COUNT 2

uniform vec3 lightCol[LIGHT_COUNT];
uniform vec3 lightPos[LIGHT_COUNT];
uniform vec3 viewPos;

#pragma glslify: specular = require('glsl-specular-gaussian')

float calcLightAttenuation(float lightDistance, float cutoffDistance, float decayExponent) {
  if (decayExponent > 0.0) {
    return pow(clamp(-lightDistance / cutoffDistance + 1.0, 0.0, 1.0), decayExponent);
  }
  return 1.0;
}

vec3 applyLight(
  vec3 albedo,
  vec3 objectPos,
  vec3 objectNor,
  float shininess,
  float specularity
) {
  vec3 sum = vec3(0);

  for (int i = 0; i < LIGHT_COUNT; i++) {
    vec3 pos = lightPos[i];
    vec3 dir = normalize(pos - objectPos);
    vec3 viewDir = normalize(pos - viewPos);
    float dif = max(0.0, dot(dir, objectNor));
    float spc = specular(dir, viewDir, objectNor, shininess) * specularity;
    float att = calcLightAttenuation(length(pos - objectPos), 35.0, 3.9);

    sum += att * dif * lightCol[i] * albedo;
    sum += att * spc * lightCol[i] * specularity;
  }

  float ambientMag1 = max(0.0, dot(normalize(vec3(0.3, -0.5, 1)), objectNor));
  vec3 ambientColor1 = vec3(0.6, 0.4, 0.4);
  float ambientMag2 = max(0.0, dot(normalize(vec3(0.4, 0.5, 0.1)), objectNor));
  vec3 ambientColor2 = vec3(0.4, 0.5, 0.7);

  sum += albedo * ambientMag1 * ambientColor1;
  sum += albedo * ambientMag2 * ambientColor2;

  return sum;
}

vec3 applyLight(vec3 albedo, vec3 objectPos, vec3 objectNor) {
  return applyLight(albedo, objectPos, objectNor, 0.95, 1.0);
}

#pragma glslify: export(applyLight)
