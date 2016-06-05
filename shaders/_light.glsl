#define LIGHT_COUNT 2

uniform vec3 lightCol[LIGHT_COUNT];
uniform vec3 lightPos[LIGHT_COUNT];

vec3 applyLight(vec3 albedo, vec3 objectPos, vec3 objectNor) {
  vec3 sum = vec3(0);

  for (int i = 0; i < LIGHT_COUNT; i++) {
    vec3 pos = lightPos[i];
    vec3 dir = normalize(pos - objectPos);
    float mag = max(0.0, dot(dir, objectNor));

    sum += mag * lightCol[i] * albedo;
  }

  float ambientMag = max(0.0, dot(normalize(vec3(0.3, -0.5, 1)), objectNor));
  vec3 ambientColor = 0.2 * vec3(1.1, 0.6, 0.9);

  sum += albedo * ambientMag * ambientColor;

  return sum;
}

#pragma glslify: export(applyLight)
