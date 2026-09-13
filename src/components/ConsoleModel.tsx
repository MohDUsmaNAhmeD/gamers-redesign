import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface ConsoleAPI {
  setPosition: (x: number, y: number, z: number) => void;
  setRotation: (x: number, y: number, z: number) => void;
  setScale: (s: number) => void;
  setOpacity: (v: number) => void;
  getObject: () => THREE.Group | null;
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildConsole(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf0f0ee,
    roughness: 0.25,
    metalness: 0.1,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1f,
    roughness: 0.4,
    metalness: 0.5,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xabf909,
    roughness: 0.2,
    metalness: 0.3,
    emissive: 0xabf909,
    emissiveIntensity: 0.3,
  });
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0x111115,
    roughness: 0.7,
    metalness: 0.2,
  });

  // Main body - tall slim design (PS5-like)
  const bodyGeo = new RoundedBoxGeometry(1.2, 3.2, 0.6, 4, 0.08);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Dark center band
  const bandGeo = new RoundedBoxGeometry(1.22, 0.08, 0.62, 2, 0.02);
  const band = new THREE.Mesh(bandGeo, darkMat);
  band.position.set(0, 0, 0);
  group.add(band);

  // Top vent slats
  for (let i = 0; i < 5; i++) {
    const ventGeo = new RoundedBoxGeometry(0.9, 0.015, 0.04, 2, 0.005);
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(0, 1.35 + i * 0.06, 0.28);
    group.add(vent);
  }

  // Disc drive bulge (subtle)
  const driveGeo = new RoundedBoxGeometry(0.5, 1.8, 0.08, 3, 0.04);
  const drive = new THREE.Mesh(driveGeo, bodyMat);
  drive.position.set(-0.45, -0.2, 0.32);
  group.add(drive);

  // USB ports
  const usbGeo = new RoundedBoxGeometry(0.12, 0.05, 0.06, 2, 0.01);
  const usb1 = new THREE.Mesh(usbGeo, darkMat);
  usb1.position.set(0.3, -1.35, 0.31);
  group.add(usb1);

  const usb2 = new THREE.Mesh(usbGeo, darkMat);
  usb2.position.set(0.3, -1.25, 0.31);
  group.add(usb2);

  // LED strip (lime accent)
  const ledGeo = new RoundedBoxGeometry(0.02, 2.6, 0.02, 2, 0.005);
  const led = new THREE.Mesh(ledGeo, accentMat);
  led.position.set(0.61, 0, 0.25);
  group.add(led);

  // Stand/base
  const standGeo = new RoundedBoxGeometry(1.0, 0.08, 0.7, 3, 0.03);
  const stand = new THREE.Mesh(standGeo, darkMat);
  stand.position.set(0, -1.65, 0);
  group.add(stand);

  // Power button (small circle on top)
  const powerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12);
  const power = new THREE.Mesh(powerGeo, accentMat);
  power.position.set(0.4, 1.62, 0.25);
  power.rotation.x = Math.PI / 2;
  group.add(power);

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

const ConsoleModel = forwardRef<ConsoleAPI>(function ConsoleModel(_, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    consoleModel: THREE.Group;
    animId: number;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    setPosition: (x: number, y: number, z: number) => {
      const s = sceneRef.current;
      if (s) s.consoleModel.position.set(x, y, z);
    },
    setRotation: (x: number, y: number, z: number) => {
      const s = sceneRef.current;
      if (s) s.consoleModel.rotation.set(x, y, z);
    },
    setScale: (v: number) => {
      const s = sceneRef.current;
      if (s) s.consoleModel.scale.setScalar(v);
    },
    setOpacity: (v: number) => {
      const s = sceneRef.current;
      if (s) {
        s.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = v;
            mat.needsUpdate = true;
          }
        });
      }
    },
    getObject: () => sceneRef.current?.consoleModel ?? null,
  }));

  useEffect(() => {
    if (reduced || !mountRef.current) return;
    const container = mountRef.current;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return;
    }

    const w = container.clientWidth || 600;
    const h = container.clientHeight || 500;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 6);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404050, 0.5);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(4, 5, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9f33ef, 0.3);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xabf909, 0.4, 12);
    rimLight.position.set(0, -2, 4);
    scene.add(rimLight);

    const consoleModel = buildConsole();
    consoleModel.position.set(0, 0, 0);
    consoleModel.rotation.y = -0.2;
    consoleModel.visible = false;
    scene.add(consoleModel);

    sceneRef.current = { renderer, scene, camera, consoleModel, animId: 0 };

    let time = 0;
    const animate = () => {
      time += 0.006;
      consoleModel.rotation.y = -0.2 + Math.sin(time) * 0.06;
      consoleModel.position.y = Math.sin(time * 0.8) * 0.02;
      renderer.render(scene, camera);
      const state = sceneRef.current;
      if (state) state.animId = requestAnimationFrame(animate);
    };
    sceneRef.current.animId = requestAnimationFrame(animate);

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(sceneRef.current?.animId ?? 0);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  return <div ref={mountRef} className="three-canvas-container console-canvas" />;
});

export default ConsoleModel;
