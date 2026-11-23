import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type BuildingKind = "mine" | "factory" | "plant" | "city";
type Building = { id: number; kind: BuildingKind; name: string; x: number; z: number; level: number };

const initialBuildings: Building[] = [
  { id: 1, kind: "mine", name: "Mine de départ", x: -7, z: -2, level: 1 },
  { id: 2, kind: "factory", name: "Centre industriel", x: 0, z: -3, level: 1 },
  { id: 3, kind: "plant", name: "Centrale expérimentale", x: 7, z: -2, level: 1 },
  { id: 4, kind: "city", name: "Ville de Valmont", x: 7, z: 7, level: 1 },
];

const moneyFormat = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " €";

export default function Game() {
  const mountRef = useRef<HTMLDivElement>(null);
  const entryBgRef = useRef<HTMLDivElement>(null);
  const [entryScreen, setEntryScreen] = useState(true);
  const [introMap, setIntroMap] = useState(false);
  const [cameraMode, setCameraMode] = useState<"management" | "exploration">("management");
  const [money, setMoney] = useState(12500);
  const [ore, setOre] = useState(0);
  const [carried, setCarried] = useState(0);
  const [stored, setStored] = useState(0);
  const [power, setPower] = useState(0);
  const [selected, setSelected] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState(initialBuildings);
  const [notice, setNotice] = useState("Bienvenue. Explore ton premier site industriel.");
  const [showBuild, setShowBuild] = useState(false);

  useEffect(() => {
    if (!entryScreen || introMap) return;
    const host = entryBgRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 180);
    camera.position.set(17, 11, 24);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc8e2eb, 0x25333a, 2.0));
    const keyLight = new THREE.DirectionalLight(0xffd99a, 2.4);
    keyLight.position.set(-12, 20, 10);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xd39a39, 34, 42);
    rimLight.position.set(7, 8, -5);
    scene.add(rimLight);

    const mat = (color: string, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(110, 90), mat("#263b3c"));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.25;
    scene.add(ground);

    const addBlock = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };
    const addCylinder = (rt: number, rb: number, h: number, x: number, y: number, z: number, material: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 12), material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };

    const hillMat = mat("#344d49");
    for (let i = 0; i < 7; i++) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(9 + (i % 3) * 2, 8 + (i % 2) * 3, 6), hillMat);
      hill.position.set(-25 + i * 9, 2, -22 - (i % 2) * 5);
      hill.rotation.y = i * 0.7;
      scene.add(hill);
    }

    const concrete = mat("#84918c");
    const dark = mat("#293a40");
    const gold = mat("#c9953e");
    const glass = new THREE.MeshStandardMaterial({ color: "#7ca7a6", emissive: "#244b4c", emissiveIntensity: 0.55, roughness: 0.3 });
    // Silhouette industrielle décorative : bâtiments, cuves et cheminées.
    addBlock(10, 5.4, 7, -5, 2.45, -2, concrete);
    addBlock(11, 0.45, 7.5, -5, 5.25, -2, gold);
    addBlock(5, 8, 5, 4, 3.7, -6, dark);
    addBlock(4.5, 6.2, 4.5, 4, 3.3, -6, glass);
    addBlock(8, 3.3, 6, 13, 1.35, 0, concrete);
    addBlock(8.5, 0.35, 6.5, 13, 3.15, 0, gold);
    for (let i = 0; i < 3; i++) {
      addCylinder(0.72, 0.9, 5.2, -13 + i * 2.2, 2.35, -8, dark);
      addCylinder(0.58, 0.72, 0.35, -13 + i * 2.2, 5.12, -8, gold);
    }
    addCylinder(0.9, 1.1, 10, 10, 4.7, -8, concrete);
    addCylinder(0.72, 0.9, 0.5, 10, 9.85, -8, gold);
    for (let i = 0; i < 4; i++) {
      const tank = addCylinder(1.05, 1.05, 2.6, 17 + (i % 2) * 2.4, 1.05, -5 + Math.floor(i / 2) * 3, glass);
      tank.rotation.z = 0;
    }
    // Tuyauteries décoratives en hauteur.
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 13, 10), gold);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(2, 4.7, 1.8);
    scene.add(pipe);

    const road = addBlock(4.5, 0.12, 46, 3, -0.08, 5, dark);
    road.rotation.y = -0.12;
    for (let i = 0; i < 8; i++) {
      const lamp = addBlock(0.12, 2.1, 0.12, 0.5, 1, -12 + i * 5, gold);
      addBlock(0.55, 0.08, 0.08, 0.72, 1.95, -12 + i * 5, gold);
      lamp.castShadow = false;
    }

    const steam: THREE.Mesh[] = [];
    const steamMat = new THREE.MeshBasicMaterial({ color: "#d8e3df", transparent: true, opacity: 0.2, depthWrite: false });
    for (let i = 0; i < 9; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.42 + (i % 3) * 0.12, 8, 7), steamMat.clone());
      puff.position.set(10 + Math.sin(i) * 0.5, 10 + i * 0.85, -8);
      scene.add(puff);
      steam.push(puff);
    }

    let frame = 0;
    let raf = 0;
    const animateBackdrop = () => {
      raf = requestAnimationFrame(animateBackdrop);
      frame += 0.003;
      camera.position.x = 17 + Math.sin(frame) * 1.15;
      camera.position.y = 11 + Math.sin(frame * 0.7) * 0.28;
      camera.lookAt(0, 3, 0);
      steam.forEach((puff, i) => {
        puff.position.y = 9.5 + ((frame * 5 + i * 1.15) % 8);
        puff.position.x = 10 + Math.sin(frame * 1.5 + i) * 0.55;
        (puff.material as THREE.MeshBasicMaterial).opacity = 0.14 + (Math.sin(frame * 2 + i) + 1) * 0.045;
      });
      renderer.render(scene, camera);
    };
    animateBackdrop();

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      steam.forEach((puff) => (puff.material as THREE.Material).dispose());
      renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
    };
  }, [entryScreen, introMap]);

  useEffect(() => {
    if (entryScreen || introMap) return;
    const host = mountRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#a9c4cb");
    scene.fog = new THREE.Fog("#a9c4cb", 32, 90);

    const camera = new THREE.PerspectiveCamera(55, host.clientWidth / host.clientHeight, 0.1, 150);
    camera.position.set(18, 20, 23);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x52604c, 2.1));
    const sun = new THREE.DirectionalLight(0xfff1d6, 2.3);
    sun.position.set(-12, 24, 12);
    sun.castShadow = true;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: "#718b68", roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(60, 30, "#a7b79b", "#849a7b");
    grid.position.y = 0.015;
    scene.add(grid);

    const roadMaterial = new THREE.MeshStandardMaterial({ color: "#48545a", roughness: 1 });
    const road = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 28), roadMaterial);
    road.position.set(4.5, 0.05, 1);
    scene.add(road);

    const objects: THREE.Object3D[] = [];
    const buildingMeshes = new Map<number, THREE.Group>();

    const addBuilding = (building: Building) => {
      const group = new THREE.Group();
      group.position.set(building.x, 0, building.z);
      const concrete = new THREE.MeshStandardMaterial({ color: "#b9c2c2", roughness: 0.88 });
      const dark = new THREE.MeshStandardMaterial({ color: "#39474c", roughness: 0.8 });
      const accent = new THREE.MeshStandardMaterial({ color: building.kind === "mine" ? "#d5a23d" : building.kind === "factory" ? "#4b9b91" : building.kind === "plant" ? "#6c8fb3" : "#d7c99f" });
      const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 4.2), dark);
      base.position.y = 0.18;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      if (building.kind === "mine") {
        const shed = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 2.6), concrete);
        shed.position.set(0, 1.25, 0);
        shed.castShadow = true;
        group.add(shed);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.2, 4), accent);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 2.95;
        roof.castShadow = true;
        group.add(roof);
        const orePile = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.2, 7), new THREE.MeshStandardMaterial({ color: "#8a8061" }));
        orePile.position.set(-2.2, 0.75, 1.8);
        orePile.rotation.x = Math.PI;
        group.add(orePile);
      } else if (building.kind === "factory") {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(4.3, 2.8, 3.3), concrete);
        hall.position.y = 1.55;
        hall.castShadow = true;
        group.add(hall);
        for (let i = 0; i < 3; i++) {
          const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.1, 12), dark);
          vent.position.set(-1.25 + i * 1.25, 3.5, -0.7);
          group.add(vent);
        }
        const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.12), accent);
        sign.position.set(0, 2.3, 1.72);
        group.add(sign);
      } else if (building.kind === "plant") {
        const reactor = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.9, 3.5, 16), concrete);
        reactor.position.y = 1.95;
        reactor.castShadow = true;
        group.add(reactor);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.65, 0.55, 16), accent);
        cap.position.y = 3.95;
        group.add(cap);
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.62, 3.5, 14), dark);
        stack.position.set(2.15, 1.9, -1.1);
        group.add(stack);
      } else {
        for (let i = 0; i < 4; i++) {
          const house = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.3, 1.25), new THREE.MeshStandardMaterial({ color: i % 2 ? "#e8d7b7" : "#d5d9d0" }));
          house.position.set(-1.4 + (i % 2) * 2.3, 0.85, -1.1 + Math.floor(i / 2) * 2.1);
          house.castShadow = true;
          group.add(house);
          const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 0.8, 4), new THREE.MeshStandardMaterial({ color: "#8c5142" }));
          roof.position.set(house.position.x, 1.85, house.position.z);
          roof.rotation.y = Math.PI / 4;
          group.add(roof);
        }
      }

      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), accent);
      marker.position.set(2.2, 0.65, 1.7);
      group.add(marker);
      scene.add(group);
      buildingMeshes.set(building.id, group);
      objects.push(group);
    };

    buildings.forEach(addBuilding);

    // First playable loop: fictional ore nodes and a simple stockpile.
    const oreNodes: THREE.Group[] = [];
    const oreMaterial = new THREE.MeshStandardMaterial({ color: "#a99a70", roughness: 0.95 });
    for (let i = 0; i < 5; i++) {
      const node = new THREE.Group();
      node.position.set(-9 + (i % 3) * 1.35, 0, 3.5 + Math.floor(i / 3) * 1.35);
      for (let j = 0; j < 4; j++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42 + (j % 2) * 0.12, 0), oreMaterial);
        rock.position.set((Math.random() - 0.5) * 0.7, 0.35 + (j % 2) * 0.25, (Math.random() - 0.5) * 0.7);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        node.add(rock);
      }
      scene.add(node);
      oreNodes.push(node);
    }
    const depot = new THREE.Group();
    depot.position.set(-3, 0, 8);
    const depotBase = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 2.8), new THREE.MeshStandardMaterial({ color: "#b58a4b" }));
    depotBase.position.y = 0.13;
    depot.add(depotBase);
    const depotRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 2.6), new THREE.MeshStandardMaterial({ color: "#344a54" }));
    depotRoof.position.y = 1.65;
    depot.add(depotRoof);
    for (const x of [-1.35, 1.35]) for (const z of [-1.05, 1.05]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.6, 0.16), darkDepotMaterial());
      post.position.set(x, 0.9, z);
      depot.add(post);
    }
    scene.add(depot);
    function darkDepotMaterial() { return new THREE.MeshStandardMaterial({ color: "#52636a" }); }

    // A simple, original low-poly engineer avatar for the first prototype.
    const player = new THREE.Group();
    const suit = new THREE.MeshStandardMaterial({ color: "#e2a33a" });
    const darkSuit = new THREE.MeshStandardMaterial({ color: "#263a45" });
    const skin = new THREE.MeshStandardMaterial({ color: "#d6a27b" });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.8, 4, 8), darkSuit);
    torso.position.y = 1.2;
    torso.castShadow = true;
    player.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 12), skin);
    head.position.y = 2.05;
    player.add(head);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), suit);
    helmet.position.y = 2.19;
    player.add(helmet);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.34), darkSuit);
    legs.position.y = 0.42;
    player.add(legs);
    player.position.set(-6, 0, 5);
    scene.add(player);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let keys: Record<string, boolean> = {};
    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    let angle = Math.PI / 4;
    let radius = 30;
    let target = new THREE.Vector3(0, 0, 0);
    let animationFrame = 0;

    const updateCamera = () => {
      if (cameraMode === "management") {
        camera.position.set(target.x + Math.sin(angle) * radius * 0.72, radius * 0.68, target.z + Math.cos(angle) * radius * 0.72);
        camera.lookAt(target);
      } else {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
        camera.position.set(player.position.x - forward.x * 6, 4.2, player.position.z - forward.z * 6);
        camera.lookAt(player.position.x, 1.5, player.position.z);
      }
    };

    let remainingOre = 20;
    let carriedUnits = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      keys[event.key.toLowerCase()] = true;
      if (event.key.toLowerCase() === "e" && cameraMode === "exploration") {
        const nearNode = oreNodes.find((node) => player.position.distanceTo(node.position) < 3.1);
        if (nearNode && remainingOre > 0 && carriedUnits < 5) {
          remainingOre -= 1;
          carriedUnits += 1;
          setCarried(carriedUnits);
          setNotice("Tu as extrait 1 unité de minerai fictif. (" + carriedUnits + "/5)");
          const rock = nearNode.children.pop();
          if (rock) {
            nearNode.remove(rock);
            (rock as THREE.Mesh).geometry.dispose();
          }
          if (nearNode.children.length === 0) {
            const index = oreNodes.indexOf(nearNode);
            if (index >= 0) oreNodes.splice(index, 1);
          }
        } else if (player.position.distanceTo(depot.position) < 3.6 && carriedUnits > 0) {
          const delivered = carriedUnits;
          carriedUnits = 0;
          setCarried(0);
          setStored((value) => value + delivered);
          setOre((value) => value + delivered);
          setMoney((value) => value + delivered * 35);
          setNotice(delivered + " unités livrées et vendues : +" + moneyFormat(delivered * 35) + ".");
        } else if (carriedUnits >= 5) {
          setNotice("Inventaire plein : retourne au dépôt pour livrer ton minerai.");
        } else if (remainingOre <= 0) {
          setNotice("Ce petit gisement est épuisé pour le moment.");
        } else {
          setNotice("Approche-toi du gisement ou du dépôt pour interagir avec E.");
        }
      }
      if (event.key.toLowerCase() === "v") setCameraMode((mode) => mode === "management" ? "exploration" : "management");
    };
    const onKeyUp = (event: KeyboardEvent) => { keys[event.key.toLowerCase()] = false; };
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
    };
    const onPointerUp = () => { dragging = false; };
    const onPointerMove = (event: PointerEvent) => {
      if (dragging && cameraMode === "management") {
        angle -= (event.clientX - previousX) * 0.006;
        radius = THREE.MathUtils.clamp(radius + (event.clientY - previousY) * 0.06, 13, 55);
        previousX = event.clientX;
        previousY = event.clientY;
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (cameraMode === "management") radius = THREE.MathUtils.clamp(radius + event.deltaY * 0.025, 13, 55);
    };
    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(objects, true);
      if (hits.length) {
        let node: THREE.Object3D | null = hits[0].object;
        while (node && !buildingMeshesHas(node, buildingMeshes)) node = node.parent;
        if (node) {
          const entry = [...buildingMeshes.entries()].find(([, group]) => group === node);
          if (entry) window.dispatchEvent(new CustomEvent("building-selected", { detail: entry[0] }));
        }
      }
    };
    function buildingMeshesHas(node: THREE.Object3D, map: Map<number, THREE.Group>) {
      return [...map.values()].includes(node as THREE.Group);
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("wheel", onWheel);
    renderer.domElement.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const clock = new THREE.Clock();
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (cameraMode === "exploration") {
        const direction = new THREE.Vector3();
        if (keys.w || keys.z || keys.arrowup) direction.z -= 1;
        if (keys.s || keys.arrowdown) direction.z += 1;
        if (keys.a || keys.q || keys.arrowleft) direction.x -= 1;
        if (keys.d || keys.arrowright) direction.x += 1;
        if (direction.lengthSq() > 0) {
          direction.normalize();
          player.position.addScaledVector(direction, delta * 6);
          player.position.x = THREE.MathUtils.clamp(player.position.x, -18, 18);
          player.position.z = THREE.MathUtils.clamp(player.position.z, -18, 18);
          player.rotation.y = Math.atan2(direction.x, direction.z);
        }
      }
      updateCamera();
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [cameraMode, buildings, entryScreen, introMap]);

  useEffect(() => {
    const onSelected = (event: Event) => {
      const id = (event as CustomEvent<number>).detail;
      setSelected(buildings.find((building) => building.id === id) ?? null);
    };
    window.addEventListener("building-selected", onSelected);
    return () => window.removeEventListener("building-selected", onSelected);
  }, [buildings]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOre((value) => value + buildings.filter((b) => b.kind === "mine").length * 2);
      setPower((value) => value + buildings.filter((b) => b.kind === "plant").length * 5);
      setMoney((value) => value + buildings.filter((b) => b.kind === "plant").length * 12);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [buildings]);

  const build = (kind: BuildingKind) => {
    const prices: Record<BuildingKind, number> = { mine: 3500, factory: 5000, plant: 9000, city: 0 };
    const labels: Record<BuildingKind, string> = { mine: "Nouvelle mine", factory: "Centre industriel", plant: "Centrale électrique", city: "Ville" };
    const price = prices[kind];
    if (money < price) {
      setNotice("Fonds insuffisants pour cette construction.");
      return;
    }
    if (kind === "city") return;
    const count = buildings.filter((b) => b.kind === kind).length;
    const positions = [{ x: -12, z: 8 }, { x: 0, z: 9 }, { x: 12, z: 9 }, { x: -12, z: -10 }, { x: 0, z: -11 }, { x: 12, z: -10 }];
    const position = positions[(buildings.length - 4) % positions.length];
    const next: Building = { id: Date.now(), kind, name: labels[kind] + (count ? " " + (count + 1) : ""), x: position.x, z: position.z, level: 1 };
    setMoney((value) => value - price);
    setBuildings((value) => [...value, next]);
    setNotice(next.name + " construite.");
    setShowBuild(false);
  };

  const upgrade = () => {
    if (!selected || money < 2500) {
      setNotice("Il faut 2 500 € pour améliorer cette installation.");
      return;
    }
    setMoney((value) => value - 2500);
    setBuildings((value) => value.map((building) => building.id === selected.id ? { ...building, level: building.level + 1 } : building));
    setSelected({ ...selected, level: selected.level + 1 });
    setNotice(selected.name + " amélioré(e).");
  };

  if (entryScreen) {
    return (
      <main className="entry-screen">
        <div className="entry-3d-backdrop" ref={entryBgRef} aria-hidden="true" />
        <div className="entry-topline">
          <div className="entry-brand"><span className="entry-logo">N</span><div><strong>NUCLEAR TYCOON</strong><small>BUILD YOUR ENERGY EMPIRE</small></div></div>
          <span className="entry-version">EARLY DEVELOPMENT · V0.3</span>
        </div>
        <section className="entry-content">
          <div className="entry-copy">
            <span className="entry-kicker"><i /> UNE NOUVELLE ÈRE INDUSTRIELLE</span>
            <h1>CHOISIS TON<br/><em>DESTIN.</em></h1>
            <p>Construis ton entreprise, développe tes infrastructures et bâtis un empire énergétique dans un vaste monde 3D.</p>
          </div>
          <div className="mode-grid">
            <button className="mode-card civil-card" onClick={() => setIntroMap(true)}>
              <div className="mode-art civil-art"><div className="art-sun"/><div className="art-hill hill-back"/><div className="art-hill hill-front"/><div className="art-factory"><i/><i/><i/></div><div className="art-road"/></div>
              <div className="mode-card-body"><span className="mode-number">01 / MODE DISPONIBLE</span><h2>MODE CIVIL</h2><p>Développe une entreprise minière et énergétique. Pars de zéro et construis ton empire industriel.</p><span className="mode-action">ENTRER DANS LE MODE <b>↗</b></span></div>
            </button>
            <div className="mode-card military-card" aria-disabled="true">
              <div className="mode-art military-art"><div className="military-grid"/><div className="military-silhouette"><i/><i/><i/><i/></div><div className="lock-symbol">⌑</div></div>
              <div className="mode-card-body"><span className="mode-number">02 / EN DÉVELOPPEMENT</span><h2>MODE MILITAIRE</h2><p>Ce mode n'est pas encore disponible. Il sera présenté dans une future mise à jour.</p><span className="coming-soon">BIENTÔT DISPONIBLE</span></div>
            </div>
          </div>
        </section>
        <footer className="entry-footer"><span>NUCLEAR TYCOON <b>©</b></span><span>UN JEU DE GESTION & D'EXPLORATION 3D</span><span>FR · EN</span></footer>
      </main>
    );
  }


  if (introMap) {
    return (
      <main className="story-map-screen">
        <header className="story-map-header">
          <div className="entry-brand"><span className="entry-logo">N</span><div><strong>NUCLEAR TYCOON</strong><small>CHAPITRE 01 · LES PREMIERS PAS</small></div></div>
          <span className="entry-version">CARTE DE CAMPAGNE</span>
        </header>
        <section className="story-map-layout">
          <div className="story-copy-panel">
            <span className="story-kicker">PROLOGUE · 06:40</span>
            <h1>Tout commence<br/><em>à Valmont.</em></h1>
            <p className="story-lead">Tu viens d'hériter d'un petit terrain à la périphérie de Valmont. Pas d'usine, pas d'équipe, presque aucun équipement. Seulement un vieux dépôt, un gisement de minerai fictif et une ambition : bâtir une entreprise qui alimentera la région en énergie.</p>
            <div className="story-brief"><span>MISSION INITIALE</span><strong>Prendre tes marques sur le terrain</strong><small>Rencontrer le site, extraire tes premières unités de minerai et les rapporter au dépôt.</small></div>
            <button className="story-start-button" onClick={() => { setIntroMap(false); setEntryScreen(false); setNotice("Bienvenue à Valmont. Va au gisement, récupère du minerai et rapporte-le au dépôt."); setCameraMode("exploration"); }}>ARRIVER SUR LE SITE <b>↗</b></button>
          </div>
          <div className="story-map-card">
            <div className="map-topline"><span>RÉGION DE VALMONT</span><span>CARTE 01 / 01</span></div>
            <div className="flat-map">
              <div className="map-contour contour-a"/><div className="map-contour contour-b"/><div className="map-river"/>
              <div className="map-road road-one"/><div className="map-road road-two"/>
              <div className="map-forest forest-one"/><div className="map-forest forest-two"/><div className="map-forest forest-three"/>
              <div className="map-town"><i/><i/><i/><i/><span>VALMONT</span></div>
              <div className="map-location-point"><span className="point-pulse"/><span className="point-core"/><label>TON TERRAIN</label></div>
              <div className="map-compass">N <b>↑</b></div><div className="map-scale"><i/> 500 m</div>
            </div>
            <div className="map-legend"><span><i className="legend-site"/> SITE DE DÉPART</span><span><i className="legend-town"/> VILLE DE VALMONT</span><span><i className="legend-road"/> ROUTE RÉGIONALE</span></div>
          </div>
        </section>
        <footer className="story-map-footer"><span>NUCLEAR TYCOON · CAMPAGNE CIVILE</span><span>UN PETIT TERRAIN. UN GRAND PROJET.</span></footer>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">N</span><div><strong>NUCLEAR TYCOON</strong><small>INDUSTRIAL EMPIRE SIMULATOR</small></div></div>
        <div className="resources">
          <div className="resource"><span>TRÉSORERIE</span><strong>{moneyFormat(money)}</strong></div>
          <div className="resource"><span>MINERAI</span><strong>{ore.toLocaleString("fr-FR")} u</strong></div>
          <div className="resource"><span>ÉLECTRICITÉ</span><strong>{power} MWh</strong></div>
        </div>
        <button className="camera-switch" onClick={() => setCameraMode((mode) => mode === "management" ? "exploration" : "management")}>{cameraMode === "management" ? "Mode exploration" : "Mode gestion"} <span>V</span></button>
      </header>

      <section className="game-layout">
        <aside className="sidebar">
          <div className="side-label">ENTREPRISE</div>
          <button className="nav-item active">▦ <span>Vue générale</span></button>
          <button className="nav-item" onClick={() => setShowBuild(true)}>＋ <span>Construire</span></button>
          <button className="nav-item" onClick={() => setNotice("La gestion détaillée sera ajoutée dans une prochaine version.")}>▤ <span>Production</span></button>
          <button className="nav-item" onClick={() => setNotice("Le réseau électrique sera développé dans la prochaine étape.")}>ϟ <span>Réseau électrique</span></button>
          <div className="side-spacer" />
          <div className="objective"><span className="side-label">OBJECTIF ACTUEL</span><strong>Extraire et vendre</strong><small>Approche-toi des rochers, appuie sur E, puis livre au dépôt.</small></div>
        </aside>

        <section className="world-panel">
          <div className="world-heading"><div><span className="eyebrow">SITE INDUSTRIEL · SECTEUR 01</span><h1>Complexe de Valmont</h1></div><span className="live-pill"><i /> SIMULATION ACTIVE</span></div>
          <div className="world-canvas" ref={mountRef}>
            <div className="world-hint">{cameraMode === "management" ? "Glisser : tourner · Molette : zoom · Cliquer : sélectionner" : "ZQSD / flèches : déplacer · E : extraire / livrer · V : changer de caméra"}</div>
            {cameraMode === "exploration" && <div className="mining-hud"><span>INVENTAIRE</span><strong>{carried} / 5</strong><small>À livrer · {stored} unités vendues</small></div>}
            {showBuild && <div className="build-modal"><div className="modal-head"><div><span className="eyebrow">DÉVELOPPEMENT</span><h2>Construire</h2></div><button className="close-button" onClick={() => setShowBuild(false)}>×</button></div><div className="build-options"><button onClick={() => build("mine")}><b>⛏</b><strong>Mine</strong><small>3 500 €</small></button><button onClick={() => build("factory")}><b>▥</b><strong>Centre industriel</strong><small>5 000 €</small></button><button onClick={() => build("plant")}><b>ϟ</b><strong>Centrale</strong><small>9 000 €</small></button></div></div>}
            {selected && <div className="selection-card"><button className="close-button" onClick={() => setSelected(null)}>×</button><span className="eyebrow">INSTALLATION SÉLECTIONNÉE</span><h2>{selected.name}</h2><p>Niveau {selected.level} · Site de Valmont</p><button className="primary-button" onClick={upgrade}>Améliorer · 2 500 €</button></div>}
          </div>
          <div className="statusbar"><span><i className="status-dot" /> {notice}</span><span>V0.2 · BOUCLE DE MINAGE</span></div>
        </section>
      </section>
      <footer className="footer"><span>NUCLEAR TYCOON</span><span>Prototype jouable en développement · Univers fictif</span></footer>
    </main>
  );
}
