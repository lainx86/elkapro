import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createContinuation } from '../src/continuation.ts';
import { journeyState } from '../src/journey.ts';
import { createFilamentField, createFallbackField, FILAMENT_COUNT } from '../src/filament-field.ts';

test('each new installation has finite geometry inside the desktop and portrait camera', () => {
  Object.defineProperty(globalThis, 'matchMedia', { value: () => ({ matches: false }), configurable: true });
  const scene = new THREE.Scene();
  const continuation = createContinuation(scene);
  assert.equal(scene.children.length, 3);
  for (const portrait of [false, true]) {
    for (const [progress, installation] of [[.6, 0], [.76, 1], [.9, 2], [1, 2]] as const) {
      const camera = new THREE.PerspectiveCamera(39, portrait ? 390 / 844 : 1440 / 900, .1, 100);
      camera.position.set(0, .1, portrait ? 18 : 12);
      const target = new THREE.Vector3(0, 0, -.25);
      continuation.update(journeyState(progress), 0, portrait, false, camera, target);
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      let visibleGeometry = 0;
      scene.children[installation].traverse(object => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
        const positions = object.geometry.attributes.position;
        for (let i = 0; i < positions.array.length; i++) assert.ok(Number.isFinite(positions.array[i]));
        if (frustum.intersectsObject(object)) visibleGeometry++;
      });
      assert.ok(scene.children[installation].visible);
      assert.ok(visibleGeometry > 0, `no artwork in the camera at ${progress}, portrait=${portrait}`);
      camera.position.toArray().forEach(v => assert.ok(Number.isFinite(v)));
    }
  }
});

test('reduced motion keeps the continuation camera stationary', () => {
  const scene = new THREE.Scene();
  const continuation = createContinuation(scene);
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, .3, 18);
  const initial = camera.position.clone();
  for (const p of [.51, .6, .76, .9, 1, .76, .6]) {
    continuation.update(journeyState(p), 0, true, true, camera, new THREE.Vector3());
    assert.deepEqual(camera.position.toArray(), initial.toArray());
  }
});

test('signal pulses move in full mode and remain fixed in reduced mode', () => {
  const field = createFilamentField();
  const pulses = field.group.children.find(object => object instanceof THREE.InstancedMesh) as THREE.InstancedMesh;
  field.update(1, 10, .6, true);
  const stationary = Array.from(pulses.instanceMatrix.array);
  field.update(1, 200, .64, true);
  assert.deepEqual(Array.from(pulses.instanceMatrix.array), stationary);
  field.update(1, 10, .6, false);
  assert.notDeepEqual(Array.from(pulses.instanceMatrix.array), stationary);
  field.update(0, 10, .6, false);
  assert.equal(field.group.visible, false);
});

test('the same luminous cores deform along the filaments and become the code braces', () => {
  const scene = new THREE.Scene();
  const continuation = createContinuation(scene);
  const camera = new THREE.PerspectiveCamera(39, 1.6, .1, 100);
  const field = scene.children[0];
  const tunnel = scene.children[1];
  const lines = field.children.find(object => object instanceof THREE.LineSegments) as THREE.LineSegments;
  const cores = tunnel.children.filter(object => object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh)) as THREE.Mesh[];
  assert.equal(cores.length, 20);
  const initialReferences = [...cores];
  assert.ok(continuation.emitters.includes(lines));
  assert.ok(cores.every(core => continuation.emitters.includes(core)), 'every morphing brace must remain an optical source');
  let previous: number[] | undefined;
  let midpoint: number[] | undefined;
  for (const progress of [.625, .66, .69, .715, .69, .66, .625]) {
    camera.position.set(0, .1, 12);
    continuation.update(journeyState(progress), 0, false, false, camera, new THREE.Vector3(0, 0, -.25));
    scene.updateMatrixWorld(true);
    const m = journeyState(progress).assembly;
    assert.equal(lines.morphTargetInfluences![0], m);
    assert.deepEqual(field.matrixWorld.elements, tunnel.matrixWorld.elements);
    for (const index of [0, 7, 19]) {
      const mesh = cores[index];
      assert.equal(mesh, initialReferences[index]);
      assert.equal((mesh.material as THREE.MeshStandardMaterial).opacity, 1);
      const material = mesh.material as THREE.MeshStandardMaterial;
      const emission = (.2126 * material.emissive.r + .7152 * material.emissive.g + .0722 * material.emissive.b) * material.emissiveIntensity;
      assert.ok(emission > 1, `HDR emission must not disappear during the morph at ${progress}`);
      const lineIndex = Math.ceil(index * FILAMENT_COUNT / 20) * 224 + 112;
      const center = new THREE.Vector3().fromBufferAttribute(lines.geometry.attributes.position, lineIndex).lerp(new THREE.Vector3().fromBufferAttribute(lines.geometry.morphAttributes.position[0], lineIndex), m);
      const ring = new THREE.Vector3();
      for (let i = 0; i < 8; i++) ring.add(mesh.getVertexPosition(56 * 9 + i, new THREE.Vector3()));
      ring.divideScalar(8);
      assert.ok(center.distanceTo(ring) < .00001, `light and brace separate at ${progress}, core ${index}`);
    }
    const marker = cores[0].getVertexPosition(56 * 9, new THREE.Vector3()).toArray();
    if (progress === .625 && !previous) previous = marker;
    else if (progress === .625) assert.deepEqual(marker, previous, 'reverse seeking must restore the geometry');
    if (progress === .66 && !midpoint) midpoint = marker;
    else if (progress === .66) assert.deepEqual(marker, midpoint);
  }
});

test('the SVG fallback deforms continuously using finite path coordinates', () => {
  const fallback = createFallbackField();
  const initial = fallback(0, 0);
  const complete = fallback(1, 0);
  assert.notEqual(initial, complete);
  for (const progress of [.625, .66, .69, .715, .76, .82]) {
    const state = journeyState(progress);
    const path = fallback(state.assembly, state.travel);
    assert.ok(path.startsWith('M'));
    assert.ok(!/NaN|Infinity/.test(path));
  }
  assert.equal(fallback(0, 0), initial);
});
