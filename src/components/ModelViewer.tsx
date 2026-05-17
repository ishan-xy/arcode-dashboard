// src/components/ModelViewer.tsx
// Renders a GLB model preview using Three.js loaded from CDN via script tag.
// Falls back to a placeholder if Three.js fails to load.

import { onMount, onCleanup, createSignal } from "solid-js";
import { API_BASE_URL } from "../../config";

type Props = {
  modelUrl: string;
  displayName: string;
};

declare const THREE: any;

let threeLoaded = false;
const threeQueue: (() => void)[] = [];

function ensureThree(cb: () => void) {
  if (threeLoaded) { cb(); return; }
  threeQueue.push(cb);
  if (document.getElementById("three-script")) return;

  const s = document.createElement("script");
  s.id = "three-script";
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  s.onload = () => {
    // Load GLTFLoader as module
    const s2 = document.createElement("script");
    s2.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
    s2.onload = () => {
      const s3 = document.createElement("script");
      s3.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js";
      s3.onload = () => {
        threeLoaded = true;
        threeQueue.forEach(fn => fn());
        threeQueue.length = 0;
      };
      document.head.appendChild(s3);
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
}

function ModelViewer(props: Props) {
  let canvasEl: HTMLCanvasElement | undefined;
  let renderer: any;
  let animId: number;
  const [status, setStatus] = createSignal<"loading" | "ready" | "error">("loading");

  onMount(() => {
    ensureThree(() => {
      if (!canvasEl) return;
      try {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0d1117);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
        camera.position.set(0, 1, 3);

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
        const size = canvasEl.parentElement?.offsetWidth || 160;
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1.2);
        dir.position.set(5, 10, 7);
        scene.add(dir);
        const dir2 = new THREE.DirectionalLight(0x00d4ff, 0.3);
        dir2.position.set(-5, -5, -5);
        scene.add(dir2);

        // Controls
        const controls = new THREE.OrbitControls(camera, canvasEl);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
        controls.enableZoom = false;

        // Load model
        const loader = new THREE.GLTFLoader();
        const fullUrl = props.modelUrl.startsWith("http") ? props.modelUrl : `${API_BASE_URL}${props.modelUrl}`;
        loader.load(
          fullUrl,
          (gltf: any) => {
            const model = gltf.scene;

            // Center and scale
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size3d = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size3d.x, size3d.y, size3d.z);
            const scale = 2 / maxDim;
            model.position.sub(center.multiplyScalar(scale));
            model.scale.setScalar(scale);

            scene.add(model);
            setStatus("ready");
          },
          undefined,
          (_err: any) => setStatus("error")
        );

        // Animate
        function animate() {
          animId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();
      } catch {
        setStatus("error");
      }
    });
  });

  onCleanup(() => {
    if (animId) cancelAnimationFrame(animId);
    if (renderer) renderer.dispose();
  });

  return (
    <div style="position:relative; width:100%; aspect-ratio:1; background:var(--bg); border-radius:8px; overflow:hidden;">
      <canvas
        ref={canvasEl}
        style={`display:block; width:100%; height:100%; ${status() !== "ready" ? "opacity:0" : "opacity:1"}; transition:opacity 0.3s;`}
      />
      {status() === "loading" && (
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;">
          <div style="width:28px; height:28px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite;" />
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">Loading model</span>
        </div>
      )}
      {status() === "error" && (
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;">
          <span style="font-size:24px; opacity:0.5;">📦</span>
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">Preview unavailable</span>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default ModelViewer;