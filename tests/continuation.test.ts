import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createContinuation } from '../src/continuation.ts';
import { journeyState } from '../src/journey.ts';

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
