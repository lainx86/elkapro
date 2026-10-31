import * as THREE from 'three';
import { journeyState, smoothRange } from './journey.ts';

type JourneyState = ReturnType<typeof journeyState>;

/** Three distinct installations share the original scene, renderer, and scroll playhead. */
export function createContinuation(scene: THREE.Scene) {
  const silver = new THREE.MeshStandardMaterial({ color: 0xd9e9f8, metalness: .92, roughness: .23, transparent: true });
  const blue = new THREE.MeshStandardMaterial({ color: 0x0050b8, metalness: .7, roughness: .2, emissive: 0x0050b8, emissiveIntensity: .5, transparent: true });
  const glow = new THREE.LineBasicMaterial({ color: 0x78c8ff, transparent: true, opacity: .6 });

  const wave = new THREE.Group();
  const ribbonPositions: number[] = [];
  const ribbonIndices: number[] = [];
  const waveform: THREE.Vector3[] = [];
  const segments = 320;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments - .5) * 11;
    const envelope = .5 + .5 * Math.cos(x * .35);
    const y = Math.sin(x * 2.8) * 1.5 * envelope;
    const z = Math.cos(x * .7) * .55;
    waveform.push(new THREE.Vector3(x, y, z));
    ribbonPositions.push(x, y, z - .24, x, y, z + .24);
    if (i < segments) {
      const a = i * 2;
      ribbonIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const ribbonGeometry = new THREE.BufferGeometry();
  ribbonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ribbonPositions, 3));
  ribbonGeometry.setIndex(ribbonIndices);
  ribbonGeometry.computeVertexNormals();
  const ribbonMaterial = silver.clone();
  ribbonMaterial.side = THREE.DoubleSide;
  wave.add(new THREE.Mesh(ribbonGeometry, ribbonMaterial));
  const waveGlow = glow.clone();
  for (let i = 0; i < 7; i++) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(waveform), waveGlow);
    line.position.set(0, (i - 3) * .09, -.2 - i * .19);
    wave.add(line);
  }
  const spectrumMaterial = blue.clone();
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(.045, 1, .055), spectrumMaterial, 72);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 72; i++) {
    const height = .12 + Math.abs(Math.sin(i * .48) * Math.cos(i * .19)) * 1.8;
    dummy.position.set((i - 35.5) * .15, -2.6 + height / 2, -.2);
    dummy.scale.set(1, height, 1);
    dummy.updateMatrix();
    bars.setMatrixAt(i, dummy.matrix);
  }
  wave.add(bars);
  scene.add(wave);

  // Physical curly braces become architectural gates, rather than another electronic component.
  const tunnel = new THREE.Group();
  const bracePoints = [[.55, 2.6], [-.15, 2.3], [-.25, 1.15], [-.36, .4], [-.85, 0], [-.36, -.4], [-.25, -1.15], [-.15, -2.3], [.55, -2.6]];
  const braceCurve = new THREE.CatmullRomCurve3(bracePoints.map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const braceGeometry = new THREE.TubeGeometry(braceCurve, 64, .095, 8, false);
  const gateSilver = silver.clone();
  const gateBlue = blue.clone();
  const gates: THREE.Group[] = [];
  for (let i = 0; i < 10; i++) {
    const gate = new THREE.Group();
    const left = new THREE.Mesh(braceGeometry, i % 3 === 1 ? gateBlue : gateSilver);
    left.position.x = -2.45;
    const right = new THREE.Mesh(braceGeometry, i % 3 === 1 ? gateBlue : gateSilver);
    right.position.x = 2.45;
    right.scale.x = -1;
    gate.add(left, right);
    gate.position.z = 6 - i * 3.5;
    gate.rotation.z = Math.sin(i * .8) * .22;
    gates.push(gate);
    tunnel.add(gate);
  }
  const bitMaterial = new THREE.MeshBasicMaterial({ color: 0x78c8ff, transparent: true });
  const bits = new THREE.InstancedMesh(new THREE.BoxGeometry(.09, .09, .22), bitMaterial, 160);
  for (let i = 0; i < 160; i++) {
    const side = i % 4;
    const lane = Math.floor(i / 4);
    dummy.position.set(side < 2 ? (side === 0 ? -3.05 : 3.05) : Math.sin(lane) * 1.4, side < 2 ? Math.sin(lane * 1.7) * 1.1 : (side === 2 ? -2.8 : 2.8), 8 - lane * .85);
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
    update(s: JourneyState, time: number, portrait: boolean, reduced: boolean, camera: THREE.PerspectiveCamera, originalTarget: THREE.Vector3) {
      const t = reduced ? 0 : time;
      wave.visible = s.wave > .001;
      tunnel.visible = s.tunnel > .001;
      network.visible = s.network > .001;
      ribbonMaterial.opacity = s.wave;
      waveGlow.opacity = s.wave * .5;
      spectrumMaterial.opacity = s.wave * .85;
      wave.position.set(portrait ? 0 : 1.5, portrait ? -1.7 : -.6, 0);
      wave.rotation.set(reduced ? -.18 : -.18 + Math.sin(t * .16) * .08, reduced ? -.15 : -.15 + smoothRange(.53, .68, s.progress) * .35, -.15);
      wave.scale.setScalar(portrait ? .72 : 1);

      gateSilver.opacity = s.tunnel;
      gateBlue.opacity = s.tunnel;
      bitMaterial.opacity = s.tunnel * .7;
      tunnel.position.y = portrait ? -1.2 : -.15;
      tunnel.scale.setScalar(portrait ? .8 : 1);
      tunnel.rotation.z = reduced ? 0 : Math.sin(t * .1) * .04;
      if (tunnel.visible) gates.forEach((gate, i) => { gate.rotation.z = Math.sin(i * .8 + t * .08) * .22; });

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
