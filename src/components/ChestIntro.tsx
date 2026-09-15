import { useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play, VolumeX, X } from "lucide-react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export default function ChestIntro({
  onFinish,
  initialProgress = 0,
}: {
  onFinish: () => void;
  initialProgress?: number;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onFinish();
      return;
    }
    const container = mount.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      onFinish();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x150720);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x150720, 0.05);
    const camera = new THREE.PerspectiveCamera(
      40,
      innerWidth / innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.5, innerWidth < 600 ? 12 : 9);
    camera.lookAt(0, 0.5, 0);
    const metal = new THREE.MeshStandardMaterial({
      color: 0x1a7a4a,
      metalness: 0.8,
      roughness: 0.28,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x150720,
      metalness: 0.65,
      roughness: 0.36,
    });
    const edge = new THREE.MeshStandardMaterial({
      color: 0xe6e4e9,
      metalness: 0.9,
      roughness: 0.3,
    });
    const lime = new THREE.MeshStandardMaterial({
      color: 0xabf909,
      emissive: 0xabf909,
      emissiveIntensity: 2.4,
      metalness: 0.3,
      roughness: 0.2,
    });
    const group = new THREE.Group();
    scene.add(group);
    const flightPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7, -.65, -1.1),
      new THREE.Vector3(-2.3, 1.35, -.6),
      new THREE.Vector3(1.65, .65, .25),
      new THREE.Vector3(0, 0, 0),
    ]);
    function box(
      w: number,
      h: number,
      d: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      parent: THREE.Group = group,
    ) {
      const mesh = new THREE.Mesh(
        new RoundedBoxGeometry(w, h, d, 2, 0.045),
        material,
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    box(2.9, 0.16, 1.8, dark, 0, -0.65, 0);
    box(2.9, 1.05, 0.16, metal, 0, -0.12, 0.83);
    box(2.9, 1.05, 0.16, metal, 0, -0.12, -0.83);
    box(0.16, 1.05, 1.8, metal, -1.37, -0.12, 0);
    box(0.16, 1.05, 1.8, metal, 1.37, -0.12, 0);
    box(2.62, 0.04, 1.52, lime, 0, -0.49, 0);
    for (const x of [-1.14, 1.14]) {
      box(0.18, 1.1, 1.86, edge, x, -0.14, 0);
      box(0.2, 0.11, 1.96, dark, x, -0.64, 0);
    }
    box(2.45, 0.075, 0.04, lime, 0, 0.24, 0.93);
    box(0.4, 0.43, 0.15, dark, 0, 0.25, 0.95);
    box(0.16, 0.2, 0.04, lime, 0, 0.25, 1.05);
    for (const x of [-0.83, -0.65, -0.47, 0.47, 0.65, 0.83])
      box(0.035, 0.26, 0.06, edge, x, -0.13, 0.93);
    const lid = new THREE.Group();
    lid.position.set(0, 0.43, -0.83);
    group.add(lid);
    box(2.94, 0.33, 1.86, metal, 0, 0.15, 0.83, lid);
    box(2.42, 0.055, 1.32, dark, 0, 0.34, 0.83, lid);
    for (const x of [-1.14, 1.14])
      box(0.19, 0.38, 1.89, edge, x, 0.16, 0.83, lid);
    const emblem = box(0.43, 0.06, 0.43, lime, 0, 0.38, 0.83, lid);
    emblem.rotation.y = Math.PI / 4;
    const lining = new THREE.MeshStandardMaterial({ color: 0x150720, metalness: .35, roughness: .65 });
    box(2.45, .04, 1.37, lining, 0, -.035, .83, lid);
    for (const x of [-1.42, 1.42]) {
      for (const z of [-.84, .84]) {
        box(.23, .24, .25, dark, x, -.62, z);
        box(.12, .12, .14, edge, x, .38, z);
      }
    }
    const seal = box(.32, .038, .32, lime, 0, -.065, .83, lid);
    seal.rotation.y = Math.PI / 4;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({
        color: 0x150720,
        roughness: 0.3,
        metalness: 0.5,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.75;
    floor.receiveShadow = true;
    scene.add(floor);
    scene.add(new THREE.AmbientLight(0xe6e4e9, 2.1));
    const key = new THREE.SpotLight(0xe6e4e9, 65, 30, 0.6, 0.8);
    key.position.set(-3, 7, 5);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.PointLight(0x1a7a4a, 28, 15);
    rim.position.set(4, 2, -2);
    scene.add(rim);
    const glow = new THREE.PointLight(0xabf909, 0, 9);
    glow.position.set(0, 0.65, 0);
    group.add(glow);
    const particlePositions = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 1] = Math.random() * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xabf909,
      size: 0.022,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(geo, particleMaterial);
    group.add(particles);
    const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xabf909, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const ray = new THREE.Mesh(new THREE.CylinderGeometry(1.9, .46, 3.9, 40, 1, true), rayMaterial);
    ray.position.set(0, 2, 0);
    group.add(ray);
    let progress = initialProgress,
      smooth = initialProgress,
      interacted = initialProgress > 0,
      finished = false,
      frame = 0,
      lastTouch = 0;
    const start = performance.now();
    let lastFrame = start;
    let pausedElapsed = 0;
    let isReady = false;
    const safetyTimer = setInterval(() => {
      if (!interacted && !finished && !pausedRef.current && performance.now() - start - pausedElapsed > 5200) {
        finished = true;
        onFinish();
      }
    }, 250);
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (pausedRef.current) return;
      interacted = true;
      progress = THREE.MathUtils.clamp(
        progress + event.deltaY * 0.0015,
        0,
        1.2,
      );
    };
    const touchStart = (e: TouchEvent) => {
      lastTouch = e.touches[0].clientY;
    };
    const touch = (e: TouchEvent) => {
      e.preventDefault();
      if (pausedRef.current) return;
      interacted = true;
      progress = THREE.MathUtils.clamp(
        progress + (lastTouch - e.touches[0].clientY) * 0.005,
        0,
        1.2,
      );
      lastTouch = e.touches[0].clientY;
    };
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
      if ((e.target as HTMLElement).closest('button, a, input, textarea')) return;
      if (pausedRef.current) return;
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        interacted = true;
        progress = Math.min(1.2, progress + 0.23);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        interacted = true;
        progress = Math.max(0, progress - 0.23);
      }
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchmove", touch, { passive: false });
    window.addEventListener("keydown", keyboard);
    const resize = () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);
    const render = (now: number) => {
      if (finished) return;
      if (pausedRef.current) { pausedElapsed += now - lastFrame; lastFrame = now; frame = requestAnimationFrame(render); return; }
      const time = Math.max(0, Math.floor((now - start - pausedElapsed) / 1000 * 16) / 16);
      const delta = THREE.MathUtils.clamp((now - lastFrame) / 1000, 0, .25);
      lastFrame = now;
      const entrance = initialProgress > 0 ? 1 : Math.min(time / 1.65, 1);
      const ease = 1 - Math.pow(1 - entrance, 2);
      group.position.copy(flightPath.getPoint(ease));
      group.position.y += Math.sin(time * 1.3) * .025;
      group.rotation.y = -.38 + (1 - ease) * 2.7;
      group.rotation.z = Math.sin(entrance * Math.PI * 2) * .15 * (1 - entrance);
      if (time > 1.2 && !isReady) {
        isReady = true;
        setReady(true);
      }
      if (!interacted && time > 1.85)
        progress = Math.min(1.2, (time - 1.85) / 1.65);
      smooth += (progress - smooth) * (1 - Math.exp(-delta * 8));
      lid.rotation.x = -Math.round(Math.min(smooth, 1) * 24) / 24 * 1.85;
      glow.intensity = smooth * 19;
      particleMaterial.opacity = Math.min(smooth, 1) * 0.75;
      rayMaterial.opacity = Math.max(0, Math.min(smooth - .18, .75)) * .055;
      ray.scale.y = .45 + smooth * .55;
      particles.rotation.y = time * 0.08;
      particles.position.y = (time * 0.15) % 1;
      camera.position.z = (innerWidth < 600 ? 12 : 9) - smooth * 1.35;
      try {
        renderer.render(scene, camera);
      } catch {
        finished = true;
        onFinish();
        return;
      }
      if (container.parentElement) {
        container.parentElement.style.setProperty('--chest-light', String(Math.min(1, Math.max(0, smooth - .22))));
        container.parentElement.style.opacity = String(
          Math.max(0, 1 - Math.max(0, smooth - 0.92) / 0.25),
        );
      }
      container.dataset.progress = smooth.toFixed(3);
      if (smooth > 1.16 && !finished) {
        finished = true;
        onFinish();
        return;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      clearInterval(safetyTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touch);
      window.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", resize);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((m: THREE.Material) => m.dispose());
        }
      });
      renderer.dispose();
      container.replaceChildren();
    };
  }, [onFinish, initialProgress]);
  return (
    <div
      className={'chest-intro' + (paused ? ' motion-paused' : '')}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Gamers End. Scroll down to open the chest, or skip intro."
    >
      <div className="intro-canvas" ref={mount} />
      <div className="chest-radiance" aria-hidden="true" />
      <div className="intro-top">
        <div className="wordmark supplied-brand">
          <img src="/images/gamers-end-logo.png" alt="Gamers End" width={54} height={54} />
          <span className="brand-name">Gamers<span>End</span></span>
        </div>
        <div className="intro-controls"><button className="skip-intro" aria-label={paused ? 'Resume chest animation' : 'Pause chest animation'} aria-pressed={paused} onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); }}>{paused ? <Play size={14} /> : <Pause size={14} />} {paused ? 'Resume' : 'Pause'}</button><button className="skip-intro" onClick={onFinish}>Skip intro <X size={15} /></button></div>
      </div>
      <div className="intro-bottom">
        <h2>{ready ? "Good things inside." : "Something good is coming."}</h2>
        <p>Scroll to discover. Reverse to rewind.</p>
        <ChevronDown size={20} className="scroll-arrow" />
      </div>
    </div>
  );
}
