import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createSelectiveBloom } from '../src/selective-bloom.ts';

function rendererHarness() {
  const color = new THREE.Color(0x030916);
  let alpha = 0;
  let target: THREE.WebGLRenderTarget | null = null;
  let onRender: (object: THREE.Object3D) => void = () => {};
  const renderer = {
    autoClear: true,
    extensions: { has: () => true },
    getRenderTarget: () => target,
    setRenderTarget: (value: THREE.WebGLRenderTarget | null) => { target = value; },
    getClearColor: (value: THREE.Color) => value.copy(color),
    getClearAlpha: () => alpha,
    setClearColor: (value: THREE.ColorRepresentation, valueAlpha: number) => { color.set(value); alpha = valueAlpha; },
    clear: () => {},
    render: (object: THREE.Object3D) => onRender(object),
  };
  return { renderer: renderer as unknown as THREE.WebGLRenderer, observe: (fn: typeof onRender) => { onRender = fn; } };
}

test('only selected emission enters bloom, with occluders and canvas state restored', () => {
  const harness = rendererHarness();
  const scene = new THREE.Scene();
  const background = new THREE.Color(0x030916);
  scene.background = background;
  const emitter = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 3, 5) }));
  const surface = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
  const original = surface.material;
  const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial());
  scene.add(emitter, surface, line);
  const selectedLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: new THREE.Color(1, 2, 4) }));
  scene.add(selectedLine);
  const bloom = createSelectiveBloom(harness.renderer, scene, new THREE.PerspectiveCamera(), [emitter, selectedLine]);
  bloom.resize(4000, 2000, 3);
  let emissionRenders = 0, composites = 0;
  harness.observe(object => {
    if (object === scene) {
      emissionRenders++;
      assert.equal(scene.background, null);
      assert.equal((surface.material as THREE.MeshBasicMaterial).color.getHex(), 0);
      assert.equal(emitter.material.color.g, 3);
      assert.equal(line.visible, false);
      assert.equal(selectedLine.visible, true, 'selected filament lines must remain visible in the optical pass');
      assert.equal(selectedLine.material.color.b, 4);
      const target = harness.renderer.getRenderTarget()!;
      assert.equal(target.texture.type, THREE.HalfFloatType);
      assert.ok(target.width <= 1100 && target.height <= 700);
    } else if (object instanceof THREE.Mesh && object.material.name === 'SelectiveBloomComposite') {
      composites++;
      const material = object.material as THREE.ShaderMaterial;
      assert.equal(material.premultipliedAlpha, true);
      assert.equal(material.depthWrite, false);
      assert.equal(harness.renderer.autoClear, false, 'the base image must not be cleared');
      assert.equal(material.uniforms.bloomTexture.value.name, 'UnrealBloomPass.h0', 'only the blurred glow is added, without duplicating the base');
    }
  });
  bloom.render(1);
  assert.equal(emissionRenders, 1);
  assert.equal(composites, 1);
  assert.equal(surface.material, original);
  assert.equal(line.visible, true);
  assert.equal(scene.background, background);
  assert.equal(harness.renderer.getRenderTarget(), null);
  assert.equal(harness.renderer.autoClear, true);
  assert.equal(harness.renderer.getClearColor(new THREE.Color()).getHex(), 0x030916);
  assert.equal(harness.renderer.getClearAlpha(), 0);
  bloom.dispose();
});

test('a failed optical pass cannot leave the installation black or hide its geometry', () => {
  const harness = rendererHarness();
  const scene = new THREE.Scene();
  const surface = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
  const original = surface.material;
  const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial());
  scene.add(surface, line);
  const bloom = createSelectiveBloom(harness.renderer, scene, new THREE.PerspectiveCamera(), []);
  harness.observe(object => { if (object === scene) throw new Error('simulated GPU failure'); });
  assert.throws(() => bloom.render(1), /simulated GPU failure/);
  assert.equal(surface.material, original);
  assert.equal(line.visible, true);
  assert.equal(harness.renderer.getRenderTarget(), null);
  assert.equal(harness.renderer.autoClear, true);
  bloom.dispose();
});

test('bloom does no rendering outside its active interval or without HDR support', () => {
  for (const supported of [true, false]) {
    const harness = rendererHarness();
    harness.renderer.extensions.has = () => supported;
    harness.observe(() => assert.fail('inactive bloom must not touch the renderer'));
    const bloom = createSelectiveBloom(harness.renderer, new THREE.Scene(), new THREE.PerspectiveCamera(), []);
    bloom.render(supported ? 0 : 1);
    bloom.dispose();
  }
});
