import * as THREE from 'three';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

/** Shared optical bloom for the visible HDR sources across the continuous installation. */
export function createSelectiveBloom(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, emitters: THREE.Object3D[]) {
  const supported = renderer.extensions.has('EXT_color_buffer_float');
  const source = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  source.texture.name = 'selected-emission';
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .55, .32, .8);
  const overlayMaterial = new THREE.ShaderMaterial({
    name: 'SelectiveBloomComposite',
    uniforms: { bloomTexture: { value: bloom.renderTargetsHorizontal[0].texture } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D bloomTexture;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(texture2D(bloomTexture, vUv).rgb, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        // Zero emission stays fully transparent; encoded radiance is premultiplied.
        gl_FragColor.a = clamp(max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b), 0.0, 1.0);
      }
    `,
    transparent: true,
    premultipliedAlpha: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    toneMapped: true,
  });
  const overlay = new FullScreenQuad(overlayMaterial);
  const emitterSet = new Set(emitters);
  const black = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
  const materials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const visibility = new Map<THREE.Object3D, boolean>();
  const clearColor = new THREE.Color();

  return {
    resize(width: number, height: number, pixelRatio: number) {
      // Bound the optical buffer's fill rate separately from the crisp main scene.
      const scale = Math.min(.65, 1100 / (width * pixelRatio), 700 / (height * pixelRatio));
      const w = Math.max(32, Math.round(width * pixelRatio * scale));
      const h = Math.max(32, Math.round(height * pixelRatio * scale));
      source.setSize(w, h);
      bloom.setSize(w, h);
    },
    render(amount: number) {
      if (!supported || amount <= .001) return;
      const target = renderer.getRenderTarget();
      const autoClear = renderer.autoClear;
      const background = scene.background;
      renderer.getClearColor(clearColor);
      const clearAlpha = renderer.getClearAlpha();
      try {
        scene.background = null;
        scene.traverse(object => {
          if (emitterSet.has(object)) return;
          if (object instanceof THREE.Mesh) {
            materials.set(object, object.material);
            object.material = black;
          } else if (object instanceof THREE.Line || object instanceof THREE.Points) {
            visibility.set(object, object.visible);
            object.visible = false;
          }
        });
        renderer.autoClear = true;
        renderer.setClearColor(0x000000, 0);
        renderer.setRenderTarget(source);
        renderer.render(scene, camera);
        bloom.strength = .55 * amount;
        bloom.render(renderer, source, source, 0, false);
        renderer.setRenderTarget(target);
        renderer.autoClear = false;
        // Only the blurred mip result is added. The base scene has already been drawn.
        overlay.render(renderer);
      } finally {
        for (const [object, material] of materials) object.material = material;
        for (const [object, visible] of visibility) object.visible = visible;
        materials.clear();
        visibility.clear();
        scene.background = background;
        renderer.setRenderTarget(target);
        renderer.setClearColor(clearColor, clearAlpha);
        renderer.autoClear = autoClear;
      }
    },
    dispose() {
      source.dispose();
      bloom.dispose();
      overlayMaterial.dispose();
      overlay.dispose();
      black.dispose();
    },
  };
}
