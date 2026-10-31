import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCircuitGlow } from '../src/circuit-glow.ts';

function route(points: number[][]) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 1; i < points.length; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i - 1]), new THREE.Vector3(...points[i])));
  return path;
}

test('the halo stays centered on circuit segments including the bends', () => {
  const paths = [route([[0, 0, -.24], [0, 1, -.24], [1, 2, -.24], [1, 4, -.24]]), route([[0, 0, -.24], [-1, 0, -.24], [-2, -1, -.24]])];
  const glow = createCircuitGlow(paths);
  const positions = glow.traces.geometry.attributes.position;
  const uvs = glow.traces.geometry.attributes.uv;
  let vertex = 0;
  for (const path of paths) {
    for (const point of path.getPoints()) {
      const left = new THREE.Vector3().fromBufferAttribute(positions, vertex);
      const right = new THREE.Vector3().fromBufferAttribute(positions, vertex + 1);
      const midpoint = left.clone().add(right).multiplyScalar(.5);
      assert.ok(Math.abs(midpoint.x - point.x) < .000001);
      assert.ok(Math.abs(midpoint.y - point.y) < .000001);
      assert.ok(left.distanceTo(right) >= .2799);
      assert.ok(midpoint.z < point.z, 'the soft halo sits behind the sharp trace');
      vertex += 2;
    }
  }
  for (const value of positions.array) assert.ok(Number.isFinite(value));
  for (const value of uvs.array) assert.ok(value >= 0 && value <= 1);
});

test('pulse halos follow the moving core instances without positional or scale lag', () => {
  const paths = [route([[0, 0, -.24], [0, 2, -.24]]), route([[0, 0, -.24], [2, 0, -.24]])];
  const glow = createCircuitGlow(paths);
  const cores = new THREE.InstancedMesh(new THREE.SphereGeometry(.032), new THREE.MeshBasicMaterial(), paths.length);
  const transform = new THREE.Object3D();
  for (const progress of [0, .4, .99, .4, 0]) {
    for (let i = 0; i < paths.length; i++) {
      transform.position.copy(paths[i].getPoint(progress));
      transform.scale.setScalar(.6 + progress);
      transform.updateMatrix();
      cores.setMatrixAt(i, transform.matrix);
    }
    glow.update(.85, cores);
    assert.deepEqual(Array.from(glow.pulses.instanceMatrix.array), Array.from(cores.instanceMatrix.array));
  }
  glow.update(0, cores);
  assert.equal(glow.traces.material.uniforms.strength.value, 0);
  assert.equal(glow.pulses.material.uniforms.strength.value, 0);
});
