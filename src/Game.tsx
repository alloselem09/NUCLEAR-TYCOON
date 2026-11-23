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
  }, [cameraMode, buildings]);

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
