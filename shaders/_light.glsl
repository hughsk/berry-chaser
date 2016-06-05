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
    vec3 viewDir = normalize(viewPos - pos);
    float dif = max(0.0, dot(dir, objectNor));
    float spc = specular(dir, viewDir, objectNor, shininess) * specularity;
    float att = calcLightAttenuation(length(pos - objectPos), 35.0, 2.9);

    sum += att * dif * lightCol[i] * albedo;
    sum += att * spc * lightCol[i] * specularity;
  }

  vec3 ambientDir1 = normalize(vec3(0.3, -0.5, 0.5));
  float ambientDif1 = max(0.0, dot(ambientDir1, objectNor));
  float ambientSpc1 = specular(ambientDir1, normalize(viewPos), objectNor, 0.4) * specularity * 0.75;
  vec3 ambientColor1 = vec3(0.8, 0.4, 0.4);

  vec3 ambientDir2 = normalize(vec3(0.4, 0.5, 0.1));
  float ambientDif2 = max(0.0, dot(ambientDir2, objectNor));
  float ambientSpc2 = specular(ambientDir2, normalize(viewPos), objectNor, 0.4) * specularity * 0.75;
  vec3 ambientColor2 = vec3(0.3, 0.45, 1.05);

  sum += (albedo * ambientDif1 + ambientSpc1) * ambientColor1;
  sum += (albedo * ambientDif2 + ambientSpc2) * ambientColor2;

  return sum;
}

vec3 applyLight(vec3 albedo, vec3 objectPos, vec3 objectNor) {
  return applyLight(albedo, objectPos, objectNor, 0.95, 1.0);
}

#pragma glslify: export(applyLight)
