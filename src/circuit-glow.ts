import * as THREE from 'three';

const traceVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const traceFragment = `
  uniform vec3 glowColor;
  uniform float strength;
  varying vec2 vUv;
  void main() {
    float distanceToCore = abs(vUv.x - 0.5) * 2.0;
    float halo = max(0.0, exp(-distanceToCore * distanceToCore * 5.0) - exp(-5.0));
    float cap = smoothstep(0.0, 0.025, vUv.y) * (1.0 - smoothstep(0.975, 1.0, vUv.y));
    gl_FragColor = vec4(glowColor, halo * cap * strength);
    #include <colorspace_fragment>
  }
`;

const pulseVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Billboard in view space; both the instance and circuit keep their physical scale.
    vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float objectScale = length(modelViewMatrix[0].xyz);
    float instanceScale = length(instanceMatrix[0].xyz);
    center.xy += position.xy * objectScale * instanceScale;
    gl_Position = projectionMatrix * center;
  }
`;

const pulseFragment = `
  uniform vec3 glowColor;
  uniform float strength;
  varying vec2 vUv;
  void main() {
    float radius = length(vUv - 0.5) * 2.0;
    float softHalo = exp(-radius * radius * 5.0);
    float hotCore = exp(-radius * radius * 32.0);
    float edge = 1.0 - smoothstep(0.75, 1.0, radius);
    vec3 color = mix(glowColor, vec3(1.0), hotCore * 0.8);
    gl_FragColor = vec4(color, (softHalo * 0.7 + hotCore * 0.3) * edge * strength);
    #include <colorspace_fragment>
  }
`;

/** Local glow preserves canvas transparency and leaves the other installations untouched. */
export function createCircuitGlow(routes: THREE.CurvePath<THREE.Vector3>[]) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const halfWidth = .14;

  for (const route of routes) {
    const points = route.getPoints();
    const lengths = [0];
    for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + points[i].distanceTo(points[i - 1]));
    const base = positions.length / 3;
    for (let i = 0; i < points.length; i++) {
      const previous = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      const incoming = points[i].clone().sub(previous).normalize();
      const outgoing = next.clone().sub(points[i]).normalize();
      const tangent = incoming.clone().add(outgoing).normalize();
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0);
      const reference = i === 0 ? outgoing : incoming;
      const miter = halfWidth / Math.max(.5, Math.abs(normal.dot(new THREE.Vector3(-reference.y, reference.x, 0))));
      for (const sign of [-1, 1]) {
        positions.push(points[i].x + normal.x * miter * sign, points[i].y + normal.y * miter * sign, points[i].z - .012);
        uvs.push(sign === -1 ? 0 : 1, lengths[i] / lengths[lengths.length - 1]);
      }
      if (i < points.length - 1) {
        const a = base + i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  const traceMaterial = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0x328fff) }, strength: { value: .38 } },
    vertexShader: traceVertex,
    fragmentShader: traceFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const traces = new THREE.Mesh(geometry, traceMaterial);
  traces.name = 'circuit-soft-glow';
  const pulseMaterial = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0x9cd8ff) }, strength: { value: .95 } },
    vertexShader: pulseVertex,
    fragmentShader: pulseFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const pulses = new THREE.InstancedMesh(new THREE.PlaneGeometry(.38, .38), pulseMaterial, routes.length);
  pulses.name = 'circuit-pulse-halos';
  // Billboarding happens in the vertex shader, so the CPU's flat-plane bounds are insufficient.
  pulses.frustumCulled = false;

  return {
    traces,
    pulses,
    update(intensity: number, cores: THREE.InstancedMesh) {
      traceMaterial.uniforms.strength.value = .38 * intensity;
      pulseMaterial.uniforms.strength.value = .95 * intensity;
      pulses.instanceMatrix.array.set(cores.instanceMatrix.array);
      pulses.instanceMatrix.needsUpdate = true;
    },
  };
}
