import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { journeyState, smoothRange } from './journey';

const BLUE = 0x0050b8;
const ICE = 0x78c8ff;

export function createWorld(canvas: HTMLCanvasElement, onFailure: () => void) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x030916, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030916, .035);
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.8;
  room.dispose();
  pmrem.dispose();

  const metal = new THREE.MeshStandardMaterial({ color: 0xdce7f4, metalness: 1, roughness: .19 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x152d4b, metalness: .9, roughness: .27 });
  const blueMetal = new THREE.MeshStandardMaterial({ color: BLUE, metalness: .75, roughness: .21, emissive: 0x002b72, emissiveIntensity: .4 });
  const lightMaterial = new THREE.MeshBasicMaterial({ color: ICE, toneMapped: false });
  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xb6d9ff, 0x010616, 2));
  const key = new THREE.DirectionalLight(0xf0f7ff, 6);
  key.position.set(-3, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x137bff, 7);
  rim.position.set(4, -1, -2);
  scene.add(rim);
  const edge = new THREE.DirectionalLight(0x78c8ff, 3);
  edge.position.set(-5, -2, 2);
  scene.add(edge);

  // A beveled, extruded lightning sculpture; all artwork is native geometry.
  const bolt = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(.18, 2.7);
  shape.lineTo(-1.56, -.24);
  shape.lineTo(-.22, -.24);
  shape.lineTo(-.75, -2.8);
  shape.lineTo(1.63, .62);
  shape.lineTo(.24, .62);
  shape.lineTo(.93, 2.7);
  shape.closePath();
  const boltGeometry = new THREE.ExtrudeGeometry(shape, { depth: .35, bevelEnabled: true, bevelThickness: .1, bevelSize: .1, bevelSegments: 4, steps: 1, curveSegments: 1 });
  boltGeometry.center();
  const boltFace = new THREE.Mesh(boltGeometry, [metal, darkMetal]);
  bolt.add(boltFace);
  const boltBack = new THREE.Mesh(boltGeometry, blueMetal);
  boltBack.position.set(.13, -.08, -.3);
  bolt.add(boltBack);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(boltGeometry, 38), new THREE.LineBasicMaterial({ color: 0xb0d7ff, transparent: true, opacity: .24 }));
  bolt.add(edges);
  root.add(bolt);

  const orbits = new THREE.Group();
  const orbitGeometry = new THREE.TorusGeometry(2.6, .025, 8, 200);
  const orbit = new THREE.Mesh(orbitGeometry, metal);
  orbit.rotation.set(1.1, -.2, -.48);
  orbits.add(orbit);
  const orbitGlow = new THREE.Mesh(new THREE.TorusGeometry(2.67, .009, 5, 200, Math.PI * 1.6), lightMaterial);
  orbitGlow.rotation.copy(orbit.rotation);
  orbits.add(orbitGlow);
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(3.05, .006, 4, 180), new THREE.MeshBasicMaterial({ color: 0x38699b, transparent: true, opacity: .5 }));
  orbit2.rotation.set(.65, .85, -.6);
  orbits.add(orbit2);
  root.add(orbits);

  const circuit = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(5.7, 5.7, .09), new THREE.MeshStandardMaterial({ color: 0x06152a, metalness: .65, roughness: .5, transparent: true, opacity: .68 }));
  board.position.z = -.42;
  circuit.add(board);
  const boardEdges = new THREE.LineSegments(new THREE.EdgesGeometry(board.geometry), new THREE.LineBasicMaterial({ color: 0x2e6496, transparent: true, opacity: .45 }));
  boardEdges.position.copy(board.position);
  circuit.add(boardEdges);

  const chip = new THREE.Group();
  const chipBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, .24), darkMetal);
  chip.add(chipBase);
  const chipLid = new THREE.Mesh(new THREE.BoxGeometry(1.23, 1.23, .09), metal);
  chipLid.position.z = .15;
  chip.add(chipLid);
  const chipFace = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, .012), blueMetal);
  chipFace.position.z = .204;
  chip.add(chipFace);
  // Etched diamond sits at the center of the die.
  const dieEtch = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, .35, .22), new THREE.Vector3(.3, 0, .22), new THREE.Vector3(0, -.35, .22), new THREE.Vector3(-.3, 0, .22),
  ]), new THREE.LineBasicMaterial({ color: ICE }));
  chip.add(dieEtch);
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, .28, .07), metal, 48);
  const dummy = new THREE.Object3D();
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 12; i++) {
      const offset = (i - 5.5) * .115;
      const angle = side * Math.PI / 2;
      dummy.position.set(offset * Math.cos(angle) - .84 * Math.sin(angle), offset * Math.sin(angle) + .84 * Math.cos(angle), -.015);
      dummy.rotation.set(0, 0, angle);
      dummy.updateMatrix();
      pins.setMatrixAt(side * 12 + i, dummy.matrix);
    }
  }
  chip.add(pins);
  circuit.add(chip);

  const routes: THREE.CurvePath<THREE.Vector3>[] = [];
  const traceGeometry: THREE.BufferGeometry[] = [];
  const contactGeometry: THREE.BufferGeometry[] = [];
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 7; i++) {
      const offset = (i - 3) * .2;
      const bend = 1.05 + i * .18;
      const end = 3.1 + (i % 3) * .5;
      const angle = side * Math.PI / 2;
      const coords = [[offset, .88], [offset, bend], [offset + .6 + i * .07, bend + .6], [offset + .6 + i * .07, end]];
      const points = coords.map(([x, y]) => new THREE.Vector3(x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle), -.24));
      const path = new THREE.CurvePath<THREE.Vector3>();
      for (let j = 0; j < points.length - 1; j++) path.add(new THREE.LineCurve3(points[j], points[j + 1]));
      routes.push(path);
      traceGeometry.push(new THREE.TubeGeometry(path, 10, .009, 4, false));
      const pad = new THREE.RingGeometry(.025, .045, 10);
      pad.translate(points[3].x, points[3].y, -.24);
      contactGeometry.push(pad);
    }
  }
  const mergedTraces = mergeGeometries(traceGeometry)!;
  const traceMaterial = new THREE.MeshBasicMaterial({ color: 0x387bad, transparent: true, opacity: .7 });
  circuit.add(new THREE.Mesh(mergedTraces, traceMaterial));
  circuit.add(new THREE.Mesh(mergeGeometries(contactGeometry)!, lightMaterial));
  traceGeometry.forEach(g => g.dispose());
  contactGeometry.forEach(g => g.dispose());
  const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(.025, 6, 4), lightMaterial, routes.length);
  circuit.add(pulses);
  root.add(circuit);

  const diamonds = new THREE.Group();
  const diamondMaterial = new THREE.LineBasicMaterial({ color: 0x63abef, transparent: true, opacity: .6 });
  const diamondLines: THREE.LineLoop[] = [];
  for (let i = 0; i < 9; i++) {
    const radius = 2 + i * .15;
    const points = [new THREE.Vector3(0, radius * 1.25, 0), new THREE.Vector3(radius, 0, 0), new THREE.Vector3(0, -radius * 1.25, 0), new THREE.Vector3(-radius, 0, 0)];
    const diamond = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), diamondMaterial);
    diamond.position.z = -i * .17;
    diamondLines.push(diamond);
    diamonds.add(diamond);
  }
  root.add(diamonds);

  const particleCount = matchMedia('(max-width: 600px)').matches ? 280 : 800;
  const scattered = new Float32Array(particleCount * 3);
  const ordered = new Float32Array(particleCount * 3);
  const positions = new Float32Array(particleCount * 3);
  // Seeded placement keeps the composition consistent across refresh and scroll direction.
  let seed = 7821;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  for (let i = 0; i < particleCount; i++) {
    const j = i * 3;
    scattered[j] = (random() - .5) * 18;
    scattered[j + 1] = (random() - .5) * 12;
    scattered[j + 2] = (random() - .5) * 10 - 2;
    const row = Math.floor(i / 32);
    ordered[j] = ((i % 32) - 15.5) * .2;
    ordered[j + 1] = (row - particleCount / 64) * .22;
    ordered[j + 2] = Math.sin(i * .3) * .15;
  }
  positions.set(scattered);
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({ color: 0x91bcf0, size: .018, transparent: true, opacity: .6, sizeAttenuation: true, depthWrite: false });
  const particles = new THREE.Points(particlesGeometry, particleMaterial);
  particles.frustumCulled = false;
  scene.add(particles);

  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, .35, 12), new THREE.Vector3(1.7, .7, 10), new THREE.Vector3(.7, .8, 7.3), new THREE.Vector3(-1.1, -.3, 9), new THREE.Vector3(0, .1, 12),
  ], false, 'catmullrom', .35);
  const portraitPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, .3, 18), new THREE.Vector3(.8, .7, 15), new THREE.Vector3(.6, 1.3, 13), new THREE.Vector3(-.4, .3, 15), new THREE.Vector3(0, .3, 18),
  ], false, 'catmullrom', .35);
  const cameraTarget = new THREE.Vector3();
  let portrait = false;
  let width = 1;
  let height = 1;
  let stopped = false;
  let progress = 0;
  let minimal = false;
  let animationTime = 0;
  let lastFrameTime = 0;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let contextLost = false;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    portrait = width / height < .85;
    renderer.setPixelRatio(Math.min(devicePixelRatio, width < 700 ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }

  function render() {
    if (stopped || contextLost) return;
    const s = journeyState(progress);
    const animated = minimal ? 0 : animationTime;
    const c = minimal ? 0 : s.circuit;
    const l = minimal ? 0 : s.logic;
    const r = minimal ? 0 : s.resolve;
    const dissolve = smoothRange(.7, .9, progress);

    const rootX = minimal ? (portrait ? .3 : 1.2) : portrait ? .3 * (1 - s.outro) : 1.2 * (1 - s.circuit) + 2 * s.resolve - .5 * s.logic;
    root.position.set(rootX, portrait ? -1.35 : -.15, 0);
    root.rotation.set(.08 + c * .2, -.35 + c * .7 - l * .6 + r * .4, -.15 + c * .2);
    if (!minimal) {
      root.rotation.y += pointerX * .035 + Math.sin(animated * .24) * .025;
      root.rotation.x += pointerY * .02;
    }
    bolt.rotation.set(.07, .13 + c * .9 + l * .7, -.13 - c * .3);
    const boltScale = 1 - c * .71 + r * .28;
    bolt.scale.setScalar(boltScale);
    bolt.position.set(c * .2, c * .1, .28 + c * .5);
    orbits.rotation.set(c * .6, l * .4, animated * .035);
    orbits.scale.setScalar(1 - c * .18 + r * .12);
    circuit.scale.setScalar(.015 + c * 1.02 - r * .38);
    circuit.rotation.z = -.2 + l * .6;
    circuit.position.z = -.6;
    board.material.opacity = .65 * (1 - l * .75) * (1 - r);
    traceMaterial.opacity = (.45 + c * .4) * (1 - r * .65);
    chip.rotation.z = l * -.4;
    chipFace.material.emissiveIntensity = .6 + l * .8;
    diamondMaterial.opacity = r * .7;
    diamonds.rotation.set(.05 * (1 - r), -.2 * (1 - r), -.15 * (1 - r));
    diamonds.scale.setScalar(.8 + r * .15);
    diamondLines.forEach((diamond, i) => { diamond.rotation.z = (1 - r) * i * .12 + Math.sin(animated * .15 + i * .3) * .012 * (1 - r); });

    routes.forEach((path, i) => {
      const t = minimal ? i / routes.length : ((progress * 3.5 + animated * .1 + i / routes.length) % 1 + 1) % 1;
      dummy.position.copy(path.getPoint(t));
      dummy.scale.setScalar(.6 + c * .7);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pulses.setMatrixAt(i, dummy.matrix);
    });
    pulses.instanceMatrix.needsUpdate = true;
    pulses.computeBoundingSphere();

    const array = particlesGeometry.attributes.position.array as Float32Array;
    const order = l * (1 - dissolve);
    for (let i = 0; i < particleCount; i++) {
      const j = i * 3;
      for (let axis = 0; axis < 3; axis++) array[j + axis] = scattered[j + axis] * (1 - order) + ordered[j + axis] * order;
    }
    particlesGeometry.attributes.position.needsUpdate = true;
    particles.rotation.y = animated * .008;
    particles.position.y = portrait ? -1 : 0;
    particleMaterial.opacity = .42 + l * .25 - r * .3;

    const path = portrait ? portraitPath : cameraPath;
    camera.position.copy(path.getPointAt(minimal ? 0 : progress));
    cameraTarget.set(portrait ? 0 : -.15 * c, portrait ? .1 : 0, -.25 * c);
    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);
  }

  function tick(now: number) {
    frame = 0;
    if (stopped || contextLost || document.hidden) return;
    animationTime += lastFrameTime ? Math.min((now - lastFrameTime) / 1000, .06) : 0;
    lastFrameTime = now;
    render();
    if (!minimal) frame = requestAnimationFrame(tick);
  }

  function schedule() {
    if (!frame && !stopped && !contextLost && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function onVisibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastFrameTime = 0; }
    else schedule();
  }
  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || minimal) return;
    pointerX = event.clientX / width - .5;
    pointerY = event.clientY / height - .5;
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    onFailure();
  }
  function onContextRestored() {
    contextLost = false;
    document.documentElement.classList.add('webgl-ready');
    schedule();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  resize();
  schedule();

  return {
    update(nextProgress: number, reduced: boolean) {
      progress = nextProgress;
      minimal = reduced;
      if (minimal) { cancelAnimationFrame(frame); frame = 0; lastFrameTime = 0; }
      schedule();
    },
    dispose() {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
        }
        if (object instanceof THREE.InstancedMesh) object.dispose();
      });
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      environment.dispose();
      renderer.dispose();
    },
  };
}
