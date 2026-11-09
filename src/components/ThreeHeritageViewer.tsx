import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Model3DItem } from '../types';
import { Maximize2, Minimize2, RotateCcw, Eye, Sun, Sparkles, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  modelItem: Model3DItem;
  className?: string;
  onExplodedChange?: (value: number) => void;
}

export const ThreeHeritageViewer: React.FC<Props> = ({ modelItem, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [atmosphere, setAtmosphere] = useState<'sunrise' | 'temple' | 'sunset' | 'studio'>('temple');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // References to three objects for runtime controls
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect Software WebGL
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.04);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment map via RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('Could not build RoomEnvironment:', e);
    }

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 12;
    controls.minDistance = 1.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent flipping below ground
    controls.target.set(0, 0.7, 0);
    controls.update();
    controlsRef.current = controls;

    // Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfff5ea, 0x0f172a, 0.9);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const keyLight = new THREE.DirectionalLight(0xffecd2, 2.0);
    keyLight.position.set(3, 5, 3);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Ground Contact Shadow & Pedestal
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    scene.add(shadowPlane);

    // Circular stone altar / pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.12, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.06;
    pedestal.receiveShadow = !isSoftwareGl;
    scene.add(pedestal);

    // Build Procedural 3–12 Part Heritage Group based on modelItem.proceduralType
    const modelGroup = new THREE.Group();
    materialsRef.current = [];

    const regMat = (m: THREE.Material) => {
      materialsRef.current.push(m);
      return m;
    };

    // Shared PBR Materials
    const goldPBR = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.22,
      })
    );
    const bronzePBR = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xb45309,
        metalness: 0.8,
        roughness: 0.35,
      })
    );
    const granitePBR = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.1,
        roughness: 0.75,
      })
    );
    const crystalPBR = regMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        metalness: 0.05,
        roughness: 0.08,
        transmission: isSoftwareGl ? 0 : 0.88,
        transparent: true,
        opacity: isSoftwareGl ? 0.6 : 0.92,
        ior: 1.54,
        thickness: 0.8,
      })
    );
    const lacWoodRed = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        metalness: 0.15,
        roughness: 0.3,
      })
    );
    const lacWoodGold = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.3,
        roughness: 0.25,
      })
    );
    const teakWood = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x78350f,
        metalness: 0.05,
        roughness: 0.7,
      })
    );

    const type = modelItem.proceduralType;

    if (type === 'kalash') {
      // 1. Pedestal foot
      const footGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.15, 32);
      const foot = new THREE.Mesh(footGeo, bronzePBR);
      foot.position.y = 0.08;
      modelGroup.add(foot);

      // 2. Spherical belly of Kalash
      const bellyGeo = new THREE.SphereGeometry(0.58, 32, 24);
      bellyGeo.scale(1, 0.9, 1);
      const belly = new THREE.Mesh(bellyGeo, goldPBR);
      belly.position.y = 0.65;
      modelGroup.add(belly);

      // 3. Ornate waistband
      const ringGeo = new THREE.TorusGeometry(0.58, 0.04, 16, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, bronzePBR);
      ring.position.y = 0.65;
      modelGroup.add(ring);

      // 4. Neck of the pot
      const neckGeo = new THREE.CylinderGeometry(0.32, 0.44, 0.28, 32);
      const neck = new THREE.Mesh(neckGeo, goldPBR);
      neck.position.y = 1.15;
      modelGroup.add(neck);

      // 5. Flared mouth rim
      const rimGeo = new THREE.TorusGeometry(0.36, 0.06, 16, 32);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, bronzePBR);
      rim.position.y = 1.3;
      modelGroup.add(rim);

      // 6. Mango leaves (5 angled petals)
      const leafMat = regMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 }));
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const leafGeo = new THREE.ConeGeometry(0.14, 0.48, 6);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(Math.cos(angle) * 0.22, 1.45, Math.sin(angle) * 0.22);
        leaf.rotation.x = Math.sin(angle) * 0.4;
        leaf.rotation.z = -Math.cos(angle) * 0.4;
        modelGroup.add(leaf);
      }

      // 7. Coconut finial
      const cocoGeo = new THREE.SphereGeometry(0.24, 24, 20);
      cocoGeo.scale(0.85, 1.15, 0.85);
      const cocoMat = regMat(new THREE.MeshStandardMaterial({ color: 0x5a2d0c, roughness: 0.9 }));
      const coconut = new THREE.Mesh(cocoGeo, cocoMat);
      coconut.position.y = 1.62;
      modelGroup.add(coconut);
    } else if (type === 'lingam_gopuram') {
      // 1. Stepped granite base
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), granitePBR);
      b1.position.y = 0.1;
      modelGroup.add(b1);

      // 2. Yoni Peetham circular plinth
      const peethamGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.3, 36);
      const peetham = new THREE.Mesh(peethamGeo, granitePBR);
      peetham.position.y = 0.35;
      modelGroup.add(peetham);

      // 3. Drainage spout (Gomukha)
      const spout = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.6), granitePBR);
      spout.position.set(0, 0.35, 0.8);
      modelGroup.add(spout);

      // 4. Monolithic Sphatika Lingam (Translucent Crystal)
      const lingamCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.1, 32), crystalPBR);
      lingamCyl.position.y = 1.05;
      modelGroup.add(lingamCyl);

      const lingamDome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), crystalPBR);
      lingamDome.position.y = 1.6;
      modelGroup.add(lingamDome);

      // 5. Sacred Bilva Leaf & Tripundra marking
      const goldArch = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 16, 32, Math.PI), goldPBR);
      goldArch.position.set(0, 1.1, 0);
      modelGroup.add(goldArch);
    } else if (type === 'cotton_barrage') {
      // 1. Water bed plane
      const waterMat = regMat(
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.1,
          metalness: 0.6,
        })
      );
      const water = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.6), waterMat);
      water.position.y = 0.04;
      modelGroup.add(water);

      // 2. Masonry piers & arches (4 arches)
      const pierMat = regMat(new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }));
      for (let i = -1.5; i <= 1.5; i += 1.0) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.9), pierMat);
        pier.position.set(i, 0.42, 0);
        modelGroup.add(pier);

        // Arch span
        if (i < 1.5) {
          const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.85, 24, 1, false, 0, Math.PI), pierMat);
          arch.rotation.z = Math.PI / 2;
          arch.rotation.y = Math.PI / 2;
          arch.position.set(i + 0.5, 0.68, 0);
          modelGroup.add(arch);
        }
      }

      // 3. Roadway deck on top
      const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 0.95), pierMat);
      deck.position.y = 0.86;
      modelGroup.add(deck);

      // 4. Sluice Gate Control Tower
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.5), bronzePBR);
      tower.position.set(0, 1.3, 0);
      modelGroup.add(tower);

      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 12, 24), goldPBR);
      wheel.position.set(0, 1.75, 0);
      modelGroup.add(wheel);
    } else if (type === 'kondapalli_toy') {
      // 1. Circular painted base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.14, 32), lacWoodRed);
      base.position.y = 0.07;
      modelGroup.add(base);

      // 2. Lower body / flared robes
      const bodyGeo = new THREE.ConeGeometry(0.42, 0.85, 24);
      const body = new THREE.Mesh(bodyGeo, lacWoodGold);
      body.position.y = 0.55;
      modelGroup.add(body);

      // 3. Torso
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.45, 24), lacWoodRed);
      torso.position.y = 1.15;
      modelGroup.add(torso);

      // 4. Head and face
      const headMat = regMat(new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.3 }));
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 20), headMat);
      head.position.y = 1.48;
      modelGroup.add(head);

      // 5. Royal Crown (Kiritam)
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 16), goldPBR);
      crown.position.y = 1.82;
      modelGroup.add(crown);

      // 6. Lotus in hand
      const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), lacWoodRed);
      lotus.position.set(0.3, 1.1, 0.2);
      modelGroup.add(lotus);
    } else if (type === 'rama_bow') {
      // 1. Recurve Kodanda Bow Arch
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.85, -0.6, 0),
        new THREE.Vector3(0.4, 0, 0),
        new THREE.Vector3(-0.85, 0.6, 0)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.045, 12, false);
      const bowMesh = new THREE.Mesh(tubeGeo, goldPBR);
      bowMesh.position.set(0.2, 1.1, 0);
      modelGroup.add(bowMesh);

      // Bowstring
      const stringGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.2, 8);
      const stringMesh = new THREE.Mesh(stringGeo, bronzePBR);
      stringMesh.position.set(-0.65, 1.1, 0);
      modelGroup.add(stringMesh);

      // Arrow with golden fletching
      const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 12), bronzePBR);
      arrowShaft.rotation.z = Math.PI / 4;
      arrowShaft.position.set(0, 1.1, 0.05);
      modelGroup.add(arrowShaft);

      const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), goldPBR);
      arrowHead.rotation.z = -Math.PI / 4;
      arrowHead.position.set(0.5, 1.6, 0.05);
      modelGroup.add(arrowHead);

      // Dravidian Vimana background arch
      const vimana = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 4), granitePBR);
      vimana.rotation.y = Math.PI / 4;
      vimana.position.set(-0.3, 0.45, -0.2);
      modelGroup.add(vimana);
    } else if (type === 'harathi_diya') {
      // 1. Heavy ornate bronze base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.18, 32), bronzePBR);
      base.position.y = 0.09;
      modelGroup.add(base);

      // 2. Central pillar shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.5, 16), bronzePBR);
      shaft.position.y = 0.92;
      modelGroup.add(shaft);

      // 3. Multi-tiered oil trays (5 tiers of increasing/decreasing radius)
      for (let i = 0; i < 5; i++) {
        const yPos = 0.35 + i * 0.28;
        const rad = 0.44 - i * 0.06;
        const tray = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.85, 0.05, 24), goldPBR);
        tray.position.y = yPos;
        modelGroup.add(tray);

        // Small flame lights on tier
        const flameMat = regMat(new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        for (let j = 0; j < 6; j++) {
          const a = (j * Math.PI * 2) / 6;
          const flame = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), flameMat);
          flame.position.set(Math.cos(a) * rad, yPos + 0.04, Math.sin(a) * rad);
          modelGroup.add(flame);
        }
      }

      // 4. Peacock finial at top
      const peacock = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 12), goldPBR);
      peacock.position.y = 1.85;
      modelGroup.add(peacock);
    } else if (type === 'ancient_coin') {
      // 1. Thick embossed medallion
      const coinGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.08, 48);
      const coinMat = regMat(
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          metalness: 0.85,
          roughness: 0.38,
        })
      );
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 3;
      coin.position.y = 0.7;
      modelGroup.add(coin);

      // Raised rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.03, 16, 48), bronzePBR);
      rim.rotation.x = Math.PI / 3;
      rim.position.y = 0.7;
      modelGroup.add(rim);

      // Ship mast cross motif
      const mast = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.04), goldPBR);
      mast.rotation.x = Math.PI / 3;
      mast.position.set(0, 0.7, 0.03);
      modelGroup.add(mast);

      const sailCross = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.04), goldPBR);
      sailCross.rotation.x = Math.PI / 3;
      sailCross.position.set(0, 0.85, 0.03);
      modelGroup.add(sailCross);
    } else if (type === 'country_boat') {
      // 1. Curved canoe hull
      const hullGeo = new THREE.CylinderGeometry(0.35, 0.28, 2.4, 24, 1, false, 0, Math.PI);
      hullGeo.rotateZ(Math.PI / 2);
      hullGeo.rotateY(Math.PI / 2);
      const hull = new THREE.Mesh(hullGeo, teakWood);
      hull.position.y = 0.3;
      modelGroup.add(hull);

      // 2. Ribbed seating planks
      for (let z = -0.7; z <= 0.7; z += 0.35) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.12), teakWood);
        plank.position.set(0, 0.34, z);
        modelGroup.add(plank);
      }

      // 3. Bamboo arched canopy
      const canopyCurve = new THREE.TorusGeometry(0.26, 0.02, 8, 24, Math.PI);
      const canopyMat = regMat(new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }));
      const canopy = new THREE.Mesh(canopyCurve, canopyMat);
      canopy.position.set(0, 0.38, 0);
      modelGroup.add(canopy);

      // 4. Long steering paddle / oar
      const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), teakWood);
      oar.rotation.x = Math.PI / 3;
      oar.position.set(0.28, 0.45, 1.1);
      modelGroup.add(oar);
    } else {
      // Default fallback composite group
      const fallbackMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), goldPBR);
      fallbackMesh.position.y = 0.8;
      modelGroup.add(fallbackMesh);
    }

    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    setIsLoading(false);

    // Animation & Render Loop
    let animId = 0;
    let isRunning = true;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (!isRunning) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          animId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          animId = window.setTimeout(cb, 60);
        }
      };
      animId = window.setTimeout(poll, 5);
    }

    const clock = new THREE.Clock();

    const tick = () => {
      if (!isRunning) return;
      const delta = clock.getDelta();

      if (autoRotate && modelGroup) {
        modelGroup.rotation.y += delta * 0.45;
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Window Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(animId);
      } else {
        cancelAnimationFrame(animId);
      }
      controls.dispose();
      renderer.dispose();
      materialsRef.current.forEach((m) => m.dispose());
      container.innerHTML = '';
    };
  }, [modelItem.id, modelItem.proceduralType]);

  // Wireframe toggle effect
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      // @ts-ignore
      mat.wireframe = wireframe;
    });
  }, [wireframe]);

  // Atmosphere lighting toggle effect
  useEffect(() => {
    if (!keyLightRef.current || !hemiLightRef.current) return;
    if (atmosphere === 'sunrise') {
      keyLightRef.current.color.setHex(0xfb923c); // Warm saffron sunrise
      keyLightRef.current.intensity = 2.4;
      hemiLightRef.current.color.setHex(0xfef08a);
    } else if (atmosphere === 'sunset') {
      keyLightRef.current.color.setHex(0xe11d48); // Deep crimson dusk
      keyLightRef.current.intensity = 2.1;
      hemiLightRef.current.color.setHex(0x38bdf8);
    } else if (atmosphere === 'temple') {
      keyLightRef.current.color.setHex(0xf59e0b); // Temple oil lamp gold
      keyLightRef.current.intensity = 2.0;
      hemiLightRef.current.color.setHex(0x1e293b);
    } else {
      keyLightRef.current.color.setHex(0xffffff); // Neutral high-CRI studio
      keyLightRef.current.intensity = 1.9;
      hemiLightRef.current.color.setHex(0x94a3b8);
    }
  }, [atmosphere]);

  const handleResetView = () => {
    if (controlsRef.current && modelGroupRef.current) {
      controlsRef.current.reset();
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-amber-500/20 bg-slate-950 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : className
      }`}
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full min-h-[380px] cursor-grab active:cursor-grabbing" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-amber-200 font-medium tracking-wide">Synthesizing 3D Heritage Artifact...</p>
        </div>
      )}

      {/* Top Left Title & Period Tag */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{modelItem.historicalPeriod}</span>
        </div>
        <p className="text-[11px] text-slate-400 px-1 font-mono tracking-wider">{modelItem.dimensions}</p>
      </div>

      {/* Top Right Fullscreen Toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-amber-400 hover:border-amber-500/40 transition shadow-lg"
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Unified Bottom Control Dock (Zero Viewport Occlusion Discipline) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-xl transition-all duration-300 ${
          isDockCollapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Handle */}
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-slate-900/90 border-t border-x border-amber-500/30 text-[11px] font-medium text-amber-300/90 hover:text-amber-200 shadow-md"
          >
            {isDockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{isDockCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
          </button>
        </div>

        {/* Dock Controls Bar */}
        <div className="rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-500/30 p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Atmosphere Presets */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              Light:
            </span>
            {(['temple', 'sunrise', 'sunset', 'studio'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAtmosphere(mode)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition ${
                  atmosphere === mode
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Auto Rotate Toggle */}
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                autoRotate
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Orbit: {autoRotate ? 'ON' : 'OFF'}
            </button>

            {/* Wireframe Toggle */}
            <button
              type="button"
              onClick={() => setWireframe(!wireframe)}
              className={`p-1.5 rounded-md text-[11px] transition ${
                wireframe ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Wireframe"
              aria-label="Toggle Wireframe"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Reset Camera */}
            <button
              type="button"
              onClick={handleResetView}
              className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 transition"
              title="Reset View"
              aria-label="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
