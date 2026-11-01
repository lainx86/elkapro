import * as THREE from 'three';
import { journeyState, smoothRange } from './journey.ts';
import { createFilamentField, FILAMENT_COUNT } from './filament-field.ts';

type JourneyState = ReturnType<typeof journeyState>;

/** Three distinct installations share the original scene, renderer, and scroll playhead. */
export function createContinuation(scene: THREE.Scene) {
  const silver = new THREE.MeshStandardMaterial({ color: 0xd9e9f8, metalness: .92, roughness: .23, transparent: true });
  const blue = new THREE.MeshStandardMaterial({ color: 0x0050b8, metalness: .7, roughness: .2, emissive: 0x0050b8, emissiveIntensity: .5, transparent: true });
  const glow = new THREE.LineBasicMaterial({ color: 0x78c8ff, transparent: true, opacity: .6 });

  const field = createFilamentField();
  const wave = field.group;
  const dummy = new THREE.Object3D();
  scene.add(wave);

  // Physical curly braces become architectural gates, rather than another electronic component.
  const tunnel = new THREE.Group();
  const gateSilver = silver.clone();
  const gateBlue = blue.clone();
  const finishedSilver = new THREE.Color(0xd9e9f8);
  const finishedBlue = new THREE.Color(0x0050b8);
  const gates: THREE.Mesh[] = [];
  for (let i = 0; i < 20; i++) {
    // The visible luminous core is the same mesh that widens into the metallic brace.
    const source = field.paths[Math.ceil(i * FILAMENT_COUNT / 20)];
    const geometry = new THREE.TubeGeometry(source, 112, .008, 8, false);
    const destination = new THREE.TubeGeometry(field.codePaths[i], 112, .095, 8, false);
    geometry.morphAttributes.position = [destination.attributes.position.clone()];
    geometry.morphAttributes.normal = [destination.attributes.normal.clone()];
    destination.dispose();
    const gate = new THREE.Mesh(geometry, Math.floor(i / 2) % 3 === 1 ? gateBlue : gateSilver);
    gates.push(gate);
    tunnel.add(gate);
  }
  const bitMaterial = new THREE.MeshBasicMaterial({ color: 0x78c8ff, transparent: true });
  const bits = new THREE.InstancedMesh(new THREE.BoxGeometry(.09, .09, .22), bitMaterial, 160);
  const bitPositions: THREE.Vector3[] = [];
  for (let i = 0; i < 160; i++) {
    const side = i % 4;
    const lane = Math.floor(i / 4);
    dummy.position.set(side < 2 ? (side === 0 ? -3.05 : 3.05) : Math.sin(lane) * 1.4, side < 2 ? Math.sin(lane * 1.7) * 1.1 : (side === 2 ? -2.8 : 2.8), 8 - lane * .85);
    bitPositions.push(dummy.position.clone());
    dummy.scale.set(1, 1, 1 + (i % 3));
    dummy.updateMatrix();
    bits.setMatrixAt(i, dummy.matrix);
  }
  tunnel.add(bits);
  scene.add(tunnel);

  // A spatial graph has an entirely different silhouette: connected silver nodes in an open volume.
  const network = new THREE.Group();
  const count = matchMedia('(max-width: 600px)').matches ? 64 : 112;
  const nodes: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
  for (let i = 1; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * 2.399963;
    const layer = .7 + .3 * Math.sin(i * 1.4) ** 2;
    nodes.push(new THREE.Vector3(Math.cos(angle) * radius * 3.4 * layer, y * 3, Math.sin(angle) * radius * 2.8 * layer));
  }
  const nodeMaterial = silver.clone();
  nodeMaterial.emissive.set(0x0e345e);
  nodeMaterial.emissiveIntensity = .6;
  const nodeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), nodeMaterial, count);
  const pairs: [number, number][] = [];
  const pairSet = new Set<string>();
  for (let i = 0; i < count; i++) {
    const nearest = nodes.map((point, j) => ({ j, distance: point.distanceToSquared(nodes[i]) })).filter(v => v.j !== i).sort((a, b) => a.distance - b.distance).slice(0, i === 0 ? 6 : 3);
    for (const { j } of nearest) {
      const key = [Math.min(i, j), Math.max(i, j)].join(':');
      if (!pairSet.has(key)) { pairs.push([i, j]); pairSet.add(key); }
    }
  }
  const linkPositions = pairs.flatMap(([a, b]) => [...nodes[a].toArray(), ...nodes[b].toArray()]);
  const linkMaterial = glow.clone();
  const linkGeometry = new THREE.BufferGeometry();
  linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
  network.add(new THREE.LineSegments(linkGeometry, linkMaterial), nodeMesh);
  const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xa9dcff, transparent: true });
  const packets = new THREE.InstancedMesh(new THREE.SphereGeometry(.035, 6, 4), packetMaterial, 36);
  network.add(packets);
  scene.add(network);
  const target = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();

  return {
    emitters: [...field.emitters, ...gates],
    update(s: JourneyState, time: number, portrait: boolean, reduced: boolean, camera: THREE.PerspectiveCamera, originalTarget: THREE.Vector3) {
      const t = reduced ? 0 : time;
      const assembly = s.assembly;
      field.update(s.wave, t, s.progress, reduced, assembly);
      tunnel.visible = s.tunnel > .001;
      network.visible = s.network > .001;
      wave.position.set((portrait ? .15 : 1.3) * (1 - assembly), THREE.MathUtils.lerp(portrait ? -1.8 : -.8, portrait ? -1.2 : -.15, assembly), 0);
      wave.rotation.set((.15 + Math.sin(t * .12) * .04) * (1 - assembly), (reduced ? -.25 : -.25 + smoothRange(.53, .625, s.progress) * .2) * (1 - assembly), (portrait ? .6 : .18) * (1 - assembly));
      wave.scale.setScalar(portrait ? THREE.MathUtils.lerp(.65, .8, assembly) : 1);

      gateSilver.opacity = s.tunnel;
      gateBlue.opacity = s.tunnel;
      bitMaterial.opacity = s.tunnel * .7;
      tunnel.position.copy(wave.position);
      tunnel.quaternion.copy(wave.quaternion);
      tunnel.scale.copy(wave.scale);
      gateSilver.color.set(0xb9e7ff).lerp(finishedSilver, assembly);
      gateBlue.color.set(0xb9e7ff).lerp(finishedBlue, assembly);
      for (const material of [gateSilver, gateBlue]) {
        material.metalness = assembly * .92;
        material.emissive.setRGB(.7, 2.2, 4);
        material.emissiveIntensity = THREE.MathUtils.lerp(.9, .65, assembly);
      }
      gates.forEach(gate => { gate.morphTargetInfluences![0] = assembly; });
      const bitGrowth = smoothRange(.72, .76, s.progress);
      bits.visible = bitGrowth > .001;
      if (bits.visible) {
        bitPositions.forEach((position, i) => {
          dummy.position.copy(position);
          dummy.scale.set(bitGrowth, bitGrowth, bitGrowth * (1 + (i % 3)));
          dummy.updateMatrix();
          bits.setMatrixAt(i, dummy.matrix);
        });
        bits.instanceMatrix.needsUpdate = true;
        bits.computeBoundingSphere();
      }

      nodeMaterial.opacity = s.network;
      linkMaterial.opacity = s.network * .44;
      packetMaterial.opacity = s.network;
      network.position.set(portrait ? .1 : 1.8, portrait ? -1.5 : -.1, reduced ? 0 : -25);
      network.rotation.set(.2, reduced ? -.25 : -.25 + t * .04 + (s.progress - .82) * 1.4, -.1);
      network.scale.setScalar(portrait ? .8 : 1);
      if (network.visible) {
        nodes.forEach((point, i) => {
          dummy.position.copy(point);
          dummy.scale.setScalar(i === 0 ? .22 : .045 + (i % 5) * .009);
          dummy.updateMatrix();
          nodeMesh.setMatrixAt(i, dummy.matrix);
        });
        nodeMesh.instanceMatrix.needsUpdate = true;
        nodeMesh.computeBoundingSphere();
        for (let i = 0; i < 36; i++) {
          const [a, b] = pairs[(i * 7) % pairs.length];
          const offset = (i / 36 + t * .15) % 1;
          dummy.position.lerpVectors(nodes[a], nodes[b], offset);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          packets.setMatrixAt(i, dummy.matrix);
        }
        packets.instanceMatrix.needsUpdate = true;
        packets.computeBoundingSphere();
      }

      if (s.progress > .5 && !reduced) {
        // Continue from the original endpoint, then travel through the code gates to the graph.
        const handoff = s.departure;
        const z = (portrait ? 18 : 12) - s.travel * (portrait ? 26 : 24);
        target.set(Math.sin(s.travel * Math.PI) * .45, portrait ? .3 : .1, z);
        camera.position.lerp(target, handoff);
        target.set(0, portrait ? -.1 : 0, -s.travel * 25);
        lookTarget.lerpVectors(originalTarget, target, handoff);
        camera.lookAt(lookTarget);
      }
    },
  };
}
