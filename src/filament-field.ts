import * as THREE from 'three';

export const FILAMENT_COUNT = 72;

export function createCodeBraceCurve(index: number) {
  const gate = Math.floor(index / 2);
  const right = index % 2 === 1;
  const rotation = new THREE.Matrix4().makeRotationZ(Math.sin(gate * .8) * .22);
  const points = [[.55, 2.6], [-.15, 2.3], [-.25, 1.15], [-.36, .4], [-.85, 0], [-.36, -.4], [-.25, -1.15], [-.15, -2.3], [.55, -2.6]];
  return new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(right ? 2.45 - x : x - 2.45, y, 0).applyMatrix4(rotation).setZ(6 - gate * 3.5)));
}

export function createFilamentCurve(strand: number) {
  const angle = strand / FILAMENT_COUNT * Math.PI * 2;
  const radius = 1.7 + .35 * Math.sin(strand * .7);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 112; i++) {
    const t = i / 112;
    const spread = Math.sin(Math.PI * t);
    const twist = angle + (t - .5) * 1.5;
    points.push(new THREE.Vector3((t - .5) * 10.5, Math.sin(t * Math.PI * 2) * .65 + Math.sin(twist) * radius * spread, Math.cos(twist) * radius * spread * .8));
  }
  return new THREE.CatmullRomCurve3(points);
}

/** Open light paths form a spatial field, with no solid surface or spectrum bars. */
export function createFilamentField() {
  const group = new THREE.Group();
  group.name = 'filament-field';
  const positions: number[] = [];
  const colors: number[] = [];
  const destinations: number[] = [];
  const paths: THREE.CatmullRomCurve3[] = [];
  const codePaths = Array.from({ length: 20 }, (_, index) => createCodeBraceCurve(index));
  const blue = new THREE.Color(0x0050b8);
  const ice = new THREE.Color(0xa9dcff);
  const color = new THREE.Color();
  const strands = FILAMENT_COUNT;
  const samples = 112;

  for (let strand = 0; strand < strands; strand++) {
    const path = createFilamentCurve(strand);
    path.getLength();
    paths.push(path);
    for (let i = 0; i < samples; i++) {
      for (const index of [i, i + 1]) {
        const t = index / samples;
        const brightness = .12 + Math.sin(Math.PI * t) ** .6 * .88;
        color.copy(blue).lerp(ice, .25 + .6 * (strand / strands)).multiplyScalar(brightness);
        positions.push(...path.getPointAt(t).toArray());
        destinations.push(...codePaths[Math.floor(strand * 20 / strands)].getPointAt(t).toArray());
        colors.push(color.r, color.g, color.b);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(destinations, 3)];
  const fieldMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color().setRGB(3.5, 3.5, 3.5), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const strandsMesh = new THREE.LineSegments(geometry, fieldMaterial);
  group.add(strandsMesh);
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(9, 12, 16), transparent: true, depthWrite: false });
  const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(.023, 6, 4), pulseMaterial, 36);
  group.add(pulses);
  const dummy = new THREE.Object3D();
  const destination = new THREE.Vector3();

  return {
    group,
    emitters: [strandsMesh, pulses],
    paths,
    codePaths,
    update(opacity: number, time: number, progress: number, reduced: boolean, assembly = 0) {
      group.visible = opacity > .001;
      if (!group.visible) return;
      fieldMaterial.opacity = opacity * .68;
      pulseMaterial.opacity = opacity * .9;
      strandsMesh.morphTargetInfluences![0] = assembly;
      for (let i = 0; i < pulses.count; i++) {
        const offset = (i / pulses.count + (reduced ? 0 : time * .075 + progress * 2)) % 1;
        const strand = (i * 11) % strands;
        dummy.position.copy(paths[strand].getPointAt(offset));
        destination.copy(codePaths[Math.floor(strand * 20 / strands)].getPointAt(offset));
        dummy.position.lerp(destination, assembly);
        dummy.scale.setScalar(.6 + Math.sin(offset * Math.PI) * .8);
        dummy.updateMatrix();
        pulses.setMatrixAt(i, dummy.matrix);
      }
      pulses.instanceMatrix.needsUpdate = true;
      pulses.computeBoundingSphere();
    },
  };
}

/** Lightweight SVG counterpart of the same curve deformation when WebGL is unavailable. */
export function createFallbackField() {
  const from = Array.from({ length: 20 }, (_, i) => createFilamentCurve(Math.ceil(i * FILAMENT_COUNT / 20)).getSpacedPoints(40));
  const to = Array.from({ length: 20 }, (_, i) => createCodeBraceCurve(i).getSpacedPoints(40));
  return (assembly: number, travel: number) => {
    const path: string[] = [];
    for (let i = 0; i < from.length; i++) {
      let connected = false;
      for (let j = 0; j < from[i].length; j++) {
        const a = from[i][j], b = to[i][j];
        const z = a.z + (b.z - a.z) * assembly;
        const depth = 12 - travel * 24 - z;
        if (depth < .4) { connected = false; continue; }
        const x = 500 + (a.x + (b.x - a.x) * assembly) * 700 / depth;
        const y = 500 - (a.y + (b.y - a.y) * assembly) * 700 / depth;
        path.push(`${connected ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`);
        connected = true;
      }
    }
    return path.join('');
  };
}
