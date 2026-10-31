import * as THREE from 'three';

/** Open light paths form a spatial field, with no solid surface or spectrum bars. */
export function createFilamentField() {
  const group = new THREE.Group();
  group.name = 'filament-field';
  const positions: number[] = [];
  const colors: number[] = [];
  const paths: THREE.CatmullRomCurve3[] = [];
  const blue = new THREE.Color(0x0050b8);
  const ice = new THREE.Color(0xa9dcff);
  const color = new THREE.Color();
  const strands = 72;
  const samples = 112;

  for (let strand = 0; strand < strands; strand++) {
    const angle = strand / strands * Math.PI * 2;
    const radius = 1.7 + .35 * Math.sin(strand * .7);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const spread = Math.sin(Math.PI * t);
      const twist = angle + (t - .5) * 1.5;
      points.push(new THREE.Vector3(
        (t - .5) * 10.5,
        Math.sin(t * Math.PI * 2) * .65 + Math.sin(twist) * radius * spread,
        Math.cos(twist) * radius * spread * .8,
      ));
    }
    const path = new THREE.CatmullRomCurve3(points);
    path.getLength();
    paths.push(path);
    for (let i = 0; i < samples; i++) {
      for (const index of [i, i + 1]) {
        const t = index / samples;
        const brightness = .12 + Math.sin(Math.PI * t) ** .6 * .88;
        color.copy(blue).lerp(ice, .25 + .6 * (strand / strands)).multiplyScalar(brightness);
        positions.push(...points[index].toArray());
        colors.push(color.r, color.g, color.b);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const fieldMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  group.add(new THREE.LineSegments(geometry, fieldMaterial));

  const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xb9e7ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  for (const index of [4, 18, 33, 49, 63]) {
    group.add(new THREE.Mesh(new THREE.TubeGeometry(paths[index], 112, .008, 4, false), coreMaterial));
  }
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xe6f5ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(.023, 6, 4), pulseMaterial, 36);
  group.add(pulses);
  const dummy = new THREE.Object3D();

  return {
    group,
    update(opacity: number, time: number, progress: number, reduced: boolean) {
      group.visible = opacity > .001;
      if (!group.visible) return;
      fieldMaterial.opacity = opacity * .68;
      coreMaterial.opacity = opacity * .58;
      pulseMaterial.opacity = opacity * .9;
      for (let i = 0; i < pulses.count; i++) {
        const offset = (i / pulses.count + (reduced ? 0 : time * .075 + progress * 2)) % 1;
        dummy.position.copy(paths[(i * 11) % strands].getPointAt(offset));
        dummy.scale.setScalar(.6 + Math.sin(offset * Math.PI) * .8);
        dummy.updateMatrix();
        pulses.setMatrixAt(i, dummy.matrix);
      }
      pulses.instanceMatrix.needsUpdate = true;
      pulses.computeBoundingSphere();
    },
  };
}
