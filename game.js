import { createCharacter } from './character.js';
import { createDesertLandscape } from './desert-landscape.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bb4b1);
scene.fog = new THREE.Fog(0x9bb4b1, 38, 5200);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 6500);
camera.position.set(10, 10, 14);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

scene.add(new THREE.HemisphereLight(0xdceeff, 0x45564a, 2.0));
const sun = new THREE.DirectionalLight(0xffe0b1, 3.1);
sun.position.set(-22, 32, 16); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -38; sun.shadow.camera.right = 38; sun.shadow.camera.top = 38; sun.shadow.camera.bottom = -38;
scene.add(sun);

const mat = (color, roughness=0.85, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const groundMat = mat('#687d69');
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150,150), groundMat);
ground.rotation.x = -Math.PI/2; ground.position.y = -0.08; ground.receiveShadow = true; scene.add(ground);

const grid = new THREE.GridHelper(120, 60, 0x84968a, 0x84968a);
grid.position.y = -0.06; grid.material.transparent = true; grid.material.opacity = 0.12; scene.add(grid);

function box(parent, w,h,d, x,y,z, material, cast=true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
  m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; parent.add(m); return m;
}
function cylinder(parent, rt,rb,h,x,y,z,material,segments=20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
// Ancien dépôt civil supprimé visuellement. Point logique conservé pour la livraison.
const depot = new THREE.Object3D();
depot.position.set(0, 0, 1);

function makeTree(x,z,s=1) {
  const g=new THREE.Group(); g.userData.legacyTree=true; g.position.set(x,0,z); scene.add(g);
  cylinder(g,0.16*s,0.23*s,1.5*s,0,0.75*s,0,mat('#66523c'),9);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(1.0*s,2.4*s,8),mat('#385c48'));
  crown.position.y=2.35*s; crown.castShadow=true; g.add(crown);
}
for(let i=0;i<44;i++){ const x=(Math.random()-.5)*66,z=(Math.random()-.5)*58; if(Math.abs(x)<18&&Math.abs(z)<16)continue; makeTree(x,z,.65+Math.random()*.7); }

function road(x,z,w,d) {
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,.06,d),mat('#555d5a'));
  m.name='legacyRoad'; m.position.set(x,-.015,z); m.receiveShadow=true; scene.add(m);
  const dashMat=mat('#d6c9a4');
  if(w>d) for(let xx=-w/2+2;xx<w/2;xx+=4) box(scene,.9,.025,.09,x+xx,.03,z,dashMat,false);
  else for(let zz=-d/2+2;zz<d/2;zz+=4) box(scene,.09,.025,.9,x,.03,z+zz,dashMat,false);
}
road(0,0,4.4,52); road(-7,1,34,3.8); road(0,-7,4.4,19);

const centrifuge = new THREE.Group(); centrifuge.position.set(13,0,-7); scene.add(centrifuge);
const machineBase=mat('#293b3d',.45,.45), machineMetal=mat('#9aa9a5',.35,.65), glowMat=new THREE.MeshStandardMaterial({color:'#d7a64c',emissive:'#8b4f13',emissiveIntensity:1.5,metalness:.45,roughness:.3});
box(centrifuge,4.5,.5,4.5,0,.3,0,machineBase);
cylinder(centrifuge,1.35,1.5,2.6,0,1.8,0,machineMetal,32);
cylinder(centrifuge,1.48,1.48,.22,0,3.12,0,glowMat,32);
const rotor=new THREE.Group(); rotor.position.y=2.2; centrifuge.add(rotor);
for(let i=0;i<8;i++){const a=i*Math.PI/4;const arm=box(rotor,.17,1.55,.18,Math.cos(a)*.65,0,Math.sin(a)*.65,glowMat);arm.rotation.y=-a;}
cylinder(rotor,.35,.35,.5,0,0,0,machineBase,20);
for(let i=0;i<4;i++){const pipe=cylinder(centrifuge,.09,.09,2.8, (i-1.5)*.75,1.6,1.9,machineMetal,10);pipe.rotation.x=Math.PI/2;}

const nodes=[];
const nodePositions=[[-18,1],[-16,5],[-19,9],[-5,12],[5,12],[19,3]];
for(const [x,z] of nodePositions){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const rockMat=mat('#596b66',.98), veinMat=new THREE.MeshStandardMaterial({color:'#79d7c8',emissive:'#1c6f69',emissiveIntensity:.45,metalness:.2,roughness:.5});
 const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.85,1),rockMat);rock.position.y=.62;rock.scale.set(1.25,.8,1);rock.castShadow=true;g.add(rock);
 const vein=new THREE.Mesh(new THREE.OctahedronGeometry(.32),veinMat);vein.position.set(.05,1.05,.2);vein.castShadow=true;g.add(vein);
 nodes.push({group:g,crystal:vein,rock,active:true});
}

// PERSONNAGE PRINCIPAL — modèle articulé détaillé fourni dans character.js
const avatar=new THREE.Group();scene.add(avatar);
const hero=createCharacter(THREE,{scale:1.5});
avatar.add(hero.root);
avatar.position.set(-39,0,30);
let mineAnim=false;

// MODE MILITAIRE : personnage officiel en costume, avec mallette.
const official = new THREE.Group(); scene.add(official);
const suitMat=mat('#202a30',.72), shirtMat=mat('#d9ddd7',.7), tieMat=mat('#8d342c',.55), caseMat=mat('#6a4930',.6);
box(official,.72,.92,.42,0,1.35,0,suitMat);
box(official,.34,.62,.045,0,1.42,.235,shirtMat);
box(official,.09,.48,.055,0,1.38,.27,tieMat);
const officialHead=new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),mat('#b98262'));officialHead.position.y=2.05;official.add(officialHead);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.28,16,8,0,Math.PI*2,0,Math.PI*.48),mat('#292321'));hair.position.set(0,2.15,0);official.add(hair);
const briefcase=box(official,.48,.34,.14,.48,.85,.12,caseMat);box(official,.2,.045,.035,.48,1.05,.2,mat('#c2a36b'));
for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.12,.13,.78,10),suitMat);leg.position.set(side*.19,.39,0);official.add(leg);const arm=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.66,10),suitMat);arm.position.set(side*.43,1.35,0);arm.rotation.z=side*.12;official.add(arm);}
official.position.set(15,0,9);official.rotation.y=-1.1;official.visible=false;
const militaryWorld=new THREE.Group();scene.add(militaryWorld);
const desertMat=mat('#a18a64'), desertFloor=new THREE.Mesh(new THREE.PlaneGeometry(150,150),desertMat);desertFloor.rotation.x=-Math.PI/2;desertFloor.position.y=-.025;desertFloor.receiveShadow=true;militaryWorld.add(desertFloor);
// Le laboratoire principal est construit dans desert-landscape.js.
 // On évite de créer un second bâtiment au milieu du plateau.

// TOUR DE TRINITY — monument historique stylisé, décor uniquement.
const SITE_LAYOUT=Object.freeze({
  metersPerUnit:1,
  observationTower:{x:28,z:-3},
  pointZero:{x:28,z:-3},
  bunker:{x:28,z:3997}
});
const trinityDistance=Math.hypot(
  SITE_LAYOUT.bunker.x-SITE_LAYOUT.observationTower.x,
  SITE_LAYOUT.bunker.z-SITE_LAYOUT.observationTower.z
);
if(Math.abs(trinityDistance-4000)>.001)throw new Error('La distance décorative tour–bunker doit être exactement de 4 000 unités de jeu.');
const trinityTower=new THREE.Group();
trinityTower.name='TrinityObservationTower';
trinityTower.position.set(SITE_LAYOUT.pointZero.x,0,SITE_LAYOUT.pointZero.z);
militaryWorld.add(trinityTower);
const towerSteel=mat('#59615f',.48,.78),towerDark=mat('#303b3b',.58,.72);
const towerRust=mat('#8c6849',.82,.25),towerLampMat=new THREE.MeshStandardMaterial({color:'#e4b85e',emissive:'#d58a28',emissiveIntensity:1.6});
// TOUR D'OBSERVATION TRINITY — échelle visuelle réduite.
const towerHeight=10,towerLevels=[0,2,4,6,8,10];
const towerHalf=y=>2.35-(y/towerHeight)*.8;
function towerBeam(a,b,r,material){
 const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=new THREE.Vector3().subVectors(vb,va);
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r*.78,r,delta.length(),8),material);
 mesh.position.copy(va).add(vb).multiplyScalar(.5);
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
 mesh.castShadow=true;mesh.receiveShadow=true;trinityTower.add(mesh);return mesh;
}
for(const sx of [-1,1])for(const sz of [-1,1]){
 towerBeam([sx*2.35,0,sz*2.35],[sx*1.55,10,sz*1.55],.095,towerSteel);
}
for(let i=0;i<towerLevels.length;i++){
 const y=towerLevels[i],h=towerHalf(y);
 box(trinityTower,h*2,.16,h*2,0,y,0,towerDark);
 for(const sx of [-1,1])for(const sz of [-1,1])box(trinityTower,.19,.18,.19,sx*h,y+.09,sz*h,towerRust);
 if(i<towerLevels.length-1){
  const y2=towerLevels[i+1],h2=towerHalf(y2);
  for(const face of ['front','back','left','right']){
   let a,b,c,d;
   if(face==='front'||face==='back'){
    const sign=face==='front'?1:-1;
    a=[-h,y,sign*h];b=[h,y,sign*h];c=[h2,y2,sign*h2];d=[-h2,y2,sign*h2];
   }else{
    const sign=face==='right'?1:-1;
    a=[sign*h,y,-h];b=[sign*h,y,h];c=[sign*h2,y2,h2];d=[sign*h2,y2,-h2];
   }
   towerBeam(a,c,.045,towerSteel);towerBeam(b,d,.045,towerSteel);
   towerBeam(a,b,.035,towerRust);
  }
 }
}
for(let y=.6;y<9.5;y+=.38)box(trinityTower,.55,.045,.06,-1.55,y,-1.42,towerRust,false);
for(const x of [-1.85,-1.25])towerBeam([x,.4,-1.42],[x,9.9,-1.42],.035,towerRust);
for(const sx of [-1,1])for(const sz of [-1,1])towerBeam([sx*1.55,10,sz*1.55],[sx*1.55,10.45,sz*1.55],.04,towerSteel);
for(const side of [-1,1]){
 box(trinityTower,3.1,.07,.07,0,10.32,side*1.55,towerSteel,false);
 box(trinityTower,.07,.07,3.1,side*1.55,10.32,0,towerSteel,false);
}
box(trinityTower,3.3,.16,3.3,0,10.05,0,towerDark);
const beacon=new THREE.Mesh(new THREE.SphereGeometry(.15,12,10),towerLampMat);
beacon.position.set(0,10.65,0);trinityTower.add(beacon);
const towerLight=new THREE.PointLight('#e4b85e',1.2,10);towerLight.position.set(0,10.8,0);trinityTower.add(towerLight);
for(let i=0;i<8;i++){
 const bolt=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),towerRust);
 const a=i*Math.PI/4;bolt.position.set(Math.cos(a)*2,2,Math.sin(a)*2);trinityTower.add(bolt);
}
// Modules de recherche fictifs : accessoires visuels non fonctionnels.
// Plateau central volontairement dégagé : pas de groupe d'objets superflu.
// Nouveau décor principal : site désertique isolé, sans ville ni boulangerie.
const desertLandscape = createDesertLandscape(THREE, militaryWorld, mat, SITE_LAYOUT);
const bunkerDoor=desertLandscape.userData.bunkerDoor;

 // Porte battante du laboratoire, alignée sur l'ouverture de la façade.
 const labDoorPivot=new THREE.Group();
 labDoorPivot.position.set(-37.45,0,26.16);
 militaryWorld.add(labDoorPivot);
 box(labDoorPivot,1.3,2.3,.16,.65,1.15,0,mat('#46534d',.72,.18));
 box(labDoorPivot,.13,2.2,.08,.15,1.15,.1,mat('#b69a67',.5,.4));
 cylinder(labDoorPivot,.045,.045,.12,1.08,1.08,.12,mat('#d7bd80',.35,.55),10);
 labDoorPivot.userData.open=false;

militaryWorld.visible = true;
ground.visible = false;
grid.visible = false;
centrifuge.visible = false;
scene.children.forEach((object) => {
  if (object.userData?.legacyTree || object.name === 'legacyRoad') object.visible = false;
});
scene.background = new THREE.Color('#c58d5a');
scene.fog = new THREE.Fog('#c58d5a', 1800, 5200);




// Liaison visuelle au sol entre le Point Zéro et le bunker.
// Câbles de décor uniquement : aucune fonction de déclenchement simulée.
const bunkerCableRun=new THREE.Group();
bunkerCableRun.name='DecorativeSiteDetails';
militaryWorld.add(bunkerCableRun);

// NOUVELLES INSTALLATIONS DU SITE : mine en blocs, bâtiment centrifugeuse et vitrine de prototype fictif.
nodes.forEach(n=>{n.group.visible=false;});
const mineBlocks=[];
const mineGroup=new THREE.Group();mineGroup.position.set(-36,0,-43);militaryWorld.add(mineGroup);
const pitFloor=box(mineGroup,18,.35,14,0,-.12,0,mat('#6d4935'));
for(let x=-7;x<=7;x+=2) for(let z=-5;z<=5;z+=2){
  const blockMat=mat(['#8b6045','#9b704d','#76513e'][(Math.abs(x+z)/2)%3|0],1);
  const block=box(mineGroup,1.92,1.9,1.92,x,.95,z,blockMat);
  block.userData.mineable=true;
  mineBlocks.push({mesh:block,active:true});
  const seam=box(mineGroup,.32,.18,.32,x-.25,1.96,z-.2,mat('#c6a16b',.9));
}
for(const [x,z] of [[-9,-7],[9,-7],[-9,7],[9,7]]) box(mineGroup,.7,2.2,.7,x,1.1,z,mat('#6b5545'));

// Bâtiment de centrifugeuse : équipement scénographique, non fonctionnel.
const centrifugeBuilding=new THREE.Group();centrifugeBuilding.position.set(-19,0,-19);centrifugeBuilding.scale.setScalar(.48);militaryWorld.add(centrifugeBuilding);
box(centrifugeBuilding,13,5.8,11,0,2.9,0,mat('#777970'));
box(centrifugeBuilding,13.5,.35,11.5,0,5.85,0,mat('#303b3a'));
box(centrifugeBuilding,1.9,3.5,.16,-1.95,2.45,5.58,mat('#29383a'));
box(centrifugeBuilding,1.9,3.5,.16,1.95,2.45,5.58,mat('#29383a'));
box(centrifugeBuilding,2.0,.65,.16,0,4.0,5.58,mat('#29383a'));
for(const x of [-1.0,1.0])box(centrifugeBuilding,.12,3.5,.2,x,2.45,5.7,mat('#a2aaa0'));
const plantDoor=new THREE.Group();plantDoor.position.set(-1.35,0,5.62);centrifugeBuilding.add(plantDoor);
box(plantDoor,2.55,3.25,.12,1.275,1.625,0,mat('#344448'));
box(plantDoor,.09,3.05,.08,.18,1.62,.08,mat('#c5a96e'));
box(plantDoor,.09,3.05,.08,2.37,1.62,.08,mat('#c5a96e'));
plantDoor.userData.open=false;
const cSign=box(centrifugeBuilding,3.8,.55,.15,0,4.7,5.78,mat('#d1b474'));
const cMachine=new THREE.Group();cMachine.position.set(0,0,0);centrifugeBuilding.add(cMachine);
box(cMachine,3.8,.45,3.8,0,.25,0,mat('#252f31',.5,.4));
const cShell=cylinder(cMachine,1.05,1.2,2.6,0,1.75,0,mat('#87918b',.35,.55),24);
cylinder(cMachine,1.13,1.13,.16,0,3.08,0,mat('#d0ad62',.35,.45),24);
const cGlow=new THREE.PointLight('#d5b66c',2,8);cGlow.position.set(0,3.6,0);cMachine.add(cGlow);
const cRotor=new THREE.Group();cRotor.position.y=1.75;cMachine.add(cRotor);
for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  const fin=box(cRotor,.16,1.45,.22,Math.cos(a)*.58,0,Math.sin(a)*.58,mat('#d2b56f',.35,.55));
  fin.rotation.y=-a;
}
cylinder(cRotor,.28,.28,.38,0,0,0,mat('#344448',.4,.65),20);
const cRotorCap=cylinder(cRotor,.46,.46,.12,0,.78,0,mat('#d9c18a',.3,.55),24);

// Laboratoire rétro : vitrine avec maquette abstraite et scellée du projet Orion.
// Objet purement visuel : aucune pièce ni fonction technique représentée.
const previewCase=new THREE.Group();previewCase.position.set(-18,0,29);previewCase.scale.setScalar(.82);militaryWorld.add(previewCase);
box(previewCase,4.8,.35,3.2,0,.2,0,mat('#343f40',.45,.45));
const glassMat=new THREE.MeshStandardMaterial({color:'#9bc4c2',transparent:true,opacity:.2,metalness:.25,roughness:.15});
box(previewCase,4.5,2.7,.12,0,1.65,-1.5,glassMat,false);
box(previewCase,4.5,2.7,.12,0,1.65,1.5,glassMat,false);
box(previewCase,.12,2.7,3, -2.2,1.65,0,glassMat,false);
box(previewCase,.12,2.7,3, 2.2,1.65,0,glassMat,false);
const exhibit=new THREE.Group();exhibit.position.set(0,1.55,0);previewCase.add(exhibit);
const exhibitCore=new THREE.Mesh(new THREE.SphereGeometry(.72,24,16),new THREE.MeshStandardMaterial({color:'#b5a16d',metalness:.5,roughness:.25,emissive:'#49351b',emissiveIntensity:.45}));
exhibit.add(exhibitCore);
const exhibitRings=[];
for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05+i*.18,.045,8,48),mat(i===1?'#d6c18a':'#718d8b',.35,.65));ring.rotation.set(i*.8,.4+i*.55,0);exhibit.add(ring);exhibitRings.push(ring);}
box(previewCase,2.4,.35,.12,0,.48,1.62,mat('#d2b879',.55,.2));


 // INTÉRIEUR DU LABORATOIRE — espace séparé, accessible par la porte.
 const labInterior=new THREE.Group();labInterior.position.set(240,0,0);scene.add(labInterior);labInterior.visible=false;
 const interiorFloor=box(labInterior,16,.22,13,0,-.12,0,mat('#77796d'));
 box(labInterior,16,4.5,.25,0,2.15,-6.45,mat('#777f79'));
 box(labInterior,.25,4.5,13,-7.9,2.15,0,mat('#777f79'));
 box(labInterior,.25,4.5,13,7.9,2.15,0,mat('#777f79'));
 box(labInterior,16,.25,13,0,4.45,0,mat('#343c3a'));
 // Fenêtres hautes et poutres rétro.
 for(const x of [-5.5,-2,2,5.5]){
   box(labInterior,2.1,1.05,.08,x,3.35,-6.29,mat('#8caeaa',.35,.15),false);
   box(labInterior,.08,1.08,.1,x,3.35,-6.2,mat('#354342'));
 }
 // Grand établi central.
 box(labInterior,6.2,.22,2.1,0,1.15,-.6,mat('#454b45'));
 for(const x of [-2.7,2.7])for(const z of [-1.35,.15])box(labInterior,.18,1.1,.18,x,.55,z,mat('#303a38'));
 box(labInterior,5.9,.12,1.9,0,1.31,-.6,mat('#b3a17c',.65,.18));
 // Armoires, étagères et boîtes de rangement.
 for(const x of [-6.3,6.3]){
   box(labInterior,1.1,3.2,1.4,x,1.6,-3.9,mat('#626d68'));
   for(let y=.65;y<3;y+=.8)box(labInterior,1.12,.07,1.43,x,y,-3.9,mat('#c0b18c'));
   for(let y=.95;y<3;y+=.8)for(let z=-4.35;z<-3.4;z+=.42)box(labInterior,.28,.3,.28,x+(Math.random()-.5)*.45,y,z,mat('#8a8f81'));
 }
 // Tableau noir, plans et écrans de recherche.
 box(labInterior,4.2,1.7,.12,0,2.65,-6.22,mat('#263b3b'));
 for(let i=0;i<5;i++)box(labInterior,.045,1.25,.025,-1.45+i*.72,2.68,-6.13,mat('#c9c19e'));
 const labScreens=[];
 for(const x of [-4.3,4.3]){
   box(labInterior,2.2,1.45,.16,x,2.45,-5.3,mat('#273330'));
   const screen=box(labInterior,1.85,1.08,.05,x,2.48,-5.18,mat('#17434a',.35,.2));
   labScreens.push(screen);
   for(let i=0;i<3;i++)box(labInterior,.38,.07,.06,x-.55+i*.55,2.1,-5.12,mat('#d5b66d'));
 }
 // Petits équipements purement décoratifs sur l'établi.
 for(const [x,z] of [[-2,-.55],[0,-.55],[2,-.55]]){
   cylinder(labInterior,.32,.38,.65,x,1.72,z,mat('#a3aaa0',.38,.55),16);
   cylinder(labInterior,.36,.36,.08,x,2.08,z,mat('#d1b56f',.35,.45),16);
 }
 // Lampes suspendues.
 for(const x of [-4,0,4]){
   cylinder(labInterior,.08,.08,1.0,x,3.85,-.4,mat('#303b39'),8);
   const lamp=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshBasicMaterial({color:'#f0d99b'}));
   lamp.position.set(x,3.35,-.4);labInterior.add(lamp);
 }
 const interiorLight=new THREE.PointLight('#f0d9a3',18,24);interiorLight.position.set(0,3.6,0);labInterior.add(interiorLight);
 box(labInterior,6.9,4.5,.25,-4.45,2.15,6.45,mat('#777f79'));
 box(labInterior,6.9,4.5,.25,4.45,2.15,6.45,mat('#777f79'));
 const interiorDoor=new THREE.Group();interiorDoor.position.set(-.75,0,6.35);labInterior.add(interiorDoor);
 box(interiorDoor,1.5,2.4,.16,.75,1.2,0,mat('#48534c'));
 // Position et configuration du laboratoire.

 // CENTRALE — intérieur jouable séparé, avec centrifugeuse 3D scénographique.
 const plantInterior=new THREE.Group();plantInterior.position.set(270,0,0);scene.add(plantInterior);plantInterior.visible=false;
 const pWall=mat('#596661',.88,.12),pDark=mat('#202d30',.65,.35),pSteel=mat('#aab4ae',.32,.72),pGold=mat('#d3b36c',.38,.55);
 const pGlass=new THREE.MeshStandardMaterial({color:'#78b9b4',transparent:true,opacity:.22,metalness:.2,roughness:.18});
 box(plantInterior,22,.24,18,0,-.12,0,mat('#6a7168'));
 box(plantInterior,22,6,.35,0,3,-8.82,pWall);
 box(plantInterior,.35,6,18,-10.82,3,0,pWall);
 box(plantInterior,.35,6,18,10.82,3,0,pWall);
 box(plantInterior,22,.35,18,0,6.05,0,pDark);
 box(plantInterior,8.5,6,.35,-6.55,3,8.82,pWall);
 box(plantInterior,8.5,6,.35,6.55,3,8.82,pWall);
 box(plantInterior,5,1.2,.35,0,5.4,8.82,pWall);
 for(const x of [-8,-4,0,4,8]){
   box(plantInterior,2.6,1.45,.07,x,4.15,-8.62,pGlass,false);
   box(plantInterior,.07,1.55,.09,x,4.15,-8.55,pSteel,false);
 }
 for(const x of [-9,-6,-3,0,3,6,9])box(plantInterior,.12,.18,17.2,x,5.72,0,pSteel);
 const pLight=new THREE.PointLight('#f0d7a1',26,32);pLight.position.set(0,5.2,0);plantInterior.add(pLight);
 const pFill=new THREE.PointLight('#83b7b3',12,22);pFill.position.set(-7,3.8,-4);plantInterior.add(pFill);
 box(plantInterior,9,.35,8,0,.18,-.6,pDark);
 for(const x of [-4.3,4.3])for(const z of [-4,3])cylinder(plantInterior,.07,.07,1.1,x,.75,z,pGold,10);
 // Machine de démonstration abstraite : aucun paramètre physique réel.
 const interiorMachine=new THREE.Group();interiorMachine.position.set(0,.42,-.45);plantInterior.add(interiorMachine);
 cylinder(interiorMachine,2.0,2.15,.42,0,.28,0,pDark,40);
 cylinder(interiorMachine,1.65,1.85,2.85,0,1.9,0,pSteel,40);
 cylinder(interiorMachine,1.78,1.78,.18,0,3.38,0,pGold,40);
 const machineWindow=new THREE.Mesh(new THREE.CylinderGeometry(1.48,1.48,1.8,40,1,true),pGlass);
 machineWindow.position.y=2.05;interiorMachine.add(machineWindow);
 const interiorRotor=new THREE.Group();interiorRotor.position.y=2.08;interiorMachine.add(interiorRotor);
 cylinder(interiorRotor,.35,.35,2.05,0,0,0,pDark,24);
 for(let i=0;i<6;i++){
   const a=i*Math.PI/3;
   const blade=box(interiorRotor,.22,1.65,.32,Math.cos(a)*.62,0,Math.sin(a)*.62,pGold);
   blade.rotation.y=-a;
 }
 cylinder(interiorRotor,.58,.58,.2,0,1.05,0,pGold,32);
 cylinder(interiorRotor,.5,.5,.2,0,-1.05,0,pGold,32);
 const rotorRing=new THREE.Mesh(new THREE.TorusGeometry(1.9,.055,10,64),pGold);rotorRing.rotation.x=Math.PI/2;rotorRing.position.y=2.1;interiorMachine.add(rotorRing);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(interiorMachine,.07,.07,3.8,Math.cos(a)*2.25,1.95,Math.sin(a)*2.25,pDark,10);}
 box(plantInterior,5.4,1.15,1.1,0,1.0,-6.1,pDark);
 box(plantInterior,4.8,.72,.08,0,1.85,-6.63,mat('#183b40',.35,.2),false);
 for(let i=0;i<5;i++){const led=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:i%2?'#d7b76c':'#72c6b0'}));led.position.set(-1.7+i*.85,2.05,-6.55);plantInterior.add(led);}
 for(const x of [-8.8,8.8])box(plantInterior,.12,.04,14,x,.035,0,pGold,false);
 let insideCentrifuge=false;
 // Salle d'observation intérieure, décorative et non opérationnelle.
 const bunkerInterior=new THREE.Group();bunkerInterior.position.set(SITE_LAYOUT.bunker.x,0,SITE_LAYOUT.bunker.z);scene.add(bunkerInterior);bunkerInterior.visible=false;
 const bunkerWall=mat('#696b63',.95),bunkerFloor=mat('#514d43',.96),bunkerTrim=mat('#66523b',.92);
 box(bunkerInterior,19,.3,15,0,-.15,0,bunkerFloor);
 box(bunkerInterior,19,.28,15,0,4.65,0,mat('#333a38'));
 box(bunkerInterior,4.1,4.8,.35,-7.45,2.4,-7.32,bunkerWall);
 box(bunkerInterior,4.1,4.8,.35,7.45,2.4,-7.32,bunkerWall);
 box(bunkerInterior,10.8,1.1,.35,0,.55,-7.32,bunkerWall);
 box(bunkerInterior,10.8,.9,.35,0,4.35,-7.32,bunkerWall);
 box(bunkerInterior,.35,4.8,15,-9.32,2.4,0,bunkerWall);
 box(bunkerInterior,.35,4.8,15,9.32,2.4,0,bunkerWall);
 box(bunkerInterior,7.8,4.8,.35,-5.6,2.4,7.32,bunkerWall);
 box(bunkerInterior,7.8,4.8,.35,5.6,2.4,7.32,bunkerWall);
 box(bunkerInterior,3.9,1.25,.35,0,4.18,7.32,bunkerWall);
 const bunkerPanorama=new THREE.Mesh(new THREE.BoxGeometry(10.8,2.25,.12),new THREE.MeshStandardMaterial({color:'#789b9a',metalness:.32,roughness:.16,transparent:true,opacity:.38}));
 bunkerPanorama.position.set(0,2.75,-7.08);bunkerInterior.add(bunkerPanorama);
 for(const x of [-5.55,-2.8,0,2.8,5.55])box(bunkerInterior,.12,2.55,.2,x,2.75,-6.96,bunkerTrim);
 box(bunkerInterior,11.1,.14,.22,0,1.57,-6.96,bunkerTrim);box(bunkerInterior,11.1,.14,.22,0,3.93,-6.96,bunkerTrim);
 const bunkerInteriorDoor=new THREE.Group();bunkerInteriorDoor.position.set(-1.85,0,7.35);bunkerInterior.add(bunkerInteriorDoor);
 box(bunkerInteriorDoor,3.65,3.45,.16,1.825,1.725,0,mat('#4b4032',.92));
 box(bunkerInteriorDoor,.12,3.25,.08,.18,1.72,.12,mat('#b69a67',.55,.35));
 box(bunkerInterior,5.8,.45,1.0,0,.42,-3.9,mat('#51483a'));
 box(bunkerInterior,4.2,.12,1.8,0,.95,-1.7,mat('#6a5942'));
 for(const x of [-1.8,1.8])box(bunkerInterior,.12,.9,.12,x,.48,-1.7,bunkerTrim);
 for(const x of [-6.5,6.5]){const lamp=new THREE.PointLight('#e4c28a',9,12);lamp.position.set(x,3.8,0);bunkerInterior.add(lamp);}
 const bunkerCeilingLight=new THREE.PointLight('#e9d4ad',18,24);bunkerCeilingLight.position.set(0,4.2,1);bunkerInterior.add(bunkerCeilingLight);
 let insideBunker=false;
 function enterBunker(){
   insideBunker=true;bunkerInterior.visible=true;militaryWorld.visible=false;
   avatar.position.set(SITE_LAYOUT.bunker.x,0,SITE_LAYOUT.bunker.z+2.5);avatar.rotation.y=Math.PI;
   bunkerDoor.rotation.y=-1.35;bunkerDoor.userData.open=true;bunkerInteriorDoor.rotation.y=-1.25;
   $('pause-btn').classList.add('hidden');
   cameraYaw=0;cameraPitch=.18;cameraDistance=4.5;
   toast('Bunker d’observation : intérieur accessible.');
 }
 function exitBunker(){
   insideBunker=false;bunkerInterior.visible=false;militaryWorld.visible=true;
   avatar.position.set(SITE_LAYOUT.bunker.x,0,SITE_LAYOUT.bunker.z+5.9);avatar.rotation.y=Math.PI;
   bunkerDoor.rotation.y=0;bunkerDoor.userData.open=false;bunkerInteriorDoor.rotation.y=0;
   $('pause-btn').classList.remove('hidden');
   cameraYaw=Math.PI;cameraPitch=.38;cameraDistance=13;
   toast('Tu as quitté le bunker.');
 }
 function enterCentrifuge(){
   insideCentrifuge=true;plantInterior.visible=true;militaryWorld.visible=false;
   avatar.position.set(270,0,5.9);avatar.rotation.y=Math.PI;
   plantDoor.rotation.y=-1.25;plantDoor.userData.open=true;
   $('pause-btn').classList.add('hidden');
   $('centrifuge-panel').classList.remove('hidden');
   $('centrifuge-panel').setAttribute('aria-hidden','false');
   cameraYaw=0;cameraPitch=.2;cameraDistance=13;
   updateCentrifugeUI();
   toast('Centrale accessible : observe la centrifugeuse 3D en fonctionnement.');
 }
 function exitCentrifuge(){
   insideCentrifuge=false;plantInterior.visible=false;militaryWorld.visible=true;
   avatar.position.set(-19,0,-15.4);avatar.rotation.y=Math.PI;
   plantDoor.rotation.y=0;plantDoor.userData.open=false;
   $('pause-btn').classList.remove('hidden');
   $('centrifuge-panel').classList.add('hidden');
   $('centrifuge-panel').setAttribute('aria-hidden','true');
   cameraYaw=Math.PI;cameraPitch=.4;cameraDistance=13;
   toast('Tu as quitté la centrale.');
 }
 let insideLab=false;
 let selectedLabComponents={console:'analogique',sensors:'standard',lighting:'warm'};
 function enterLab(){
   insideLab=true;labInterior.visible=true;militaryWorld.visible=false;
   avatar.position.set(240,0,4.25);avatar.rotation.y=Math.PI;
   labDoorPivot.rotation.y=-1.25;labDoorPivot.userData.open=true;interiorDoor.rotation.y=-1.25;
   $('lab-customizer').classList.remove('hidden');
   $('lab-customizer').setAttribute('aria-hidden','false');
   $('pause-btn').classList.add('hidden');
   cameraYaw=0;cameraPitch=.28;cameraDistance=10;
   toast('Bienvenue dans le laboratoire. Configure les équipements décoratifs.');
 }
 function exitLab(){
   insideLab=false;labInterior.visible=false;militaryWorld.visible=true;
   avatar.position.set(-36.8,0,29.3);avatar.rotation.y=Math.PI;
   labDoorPivot.rotation.y=0;labDoorPivot.userData.open=false;interiorDoor.rotation.y=0;
   $('lab-customizer').classList.add('hidden');
   $('lab-customizer').setAttribute('aria-hidden','true');
   $('pause-btn').classList.remove('hidden');
   cameraYaw=Math.PI;cameraPitch=.42;cameraDistance=13;
   toast('Tu es ressorti du laboratoire.');
 }

// CINÉMATIQUE FICTIVE : salle de contrôle et spectacle lumineux stylisé.
const controlRoom=new THREE.Group();scene.add(controlRoom);
const roomWall=mat('#17262c',.92), roomTrim=mat('#52636a',.48,.45);
box(controlRoom,20,.35,18,0,-.2,0,mat('#111b20'));
box(controlRoom,5.8,8,.35,-7.1,3.8,-8.8,roomWall);
box(controlRoom,5.8,8,.35,7.1,3.8,-8.8,roomWall);
box(controlRoom,8.4,1.35,.35,0,7.1,-8.8,roomWall);
box(controlRoom,8.4,1.35,.35,0,.7,-8.8,roomWall);
const panorama=new THREE.Mesh(new THREE.PlaneGeometry(8.3,5.2),new THREE.MeshStandardMaterial({color:'#18313a',transparent:true,opacity:.22,roughness:.25,metalness:.15}));
panorama.position.set(0,4,-8.58);controlRoom.add(panorama);
box(controlRoom,.35,8,18,-10,3.8,0,roomWall);
box(controlRoom,.35,8,18,10,3.8,0,roomWall);
box(controlRoom,20,.25,18,0,7.8,0,roomWall);
for(const x of [-8,-5.4,5.4,8]){
  const screenMat=new THREE.MeshStandardMaterial({color:'#163a43',emissive:'#1c8792',emissiveIntensity:1.2,roughness:.3});
  box(controlRoom,2.15,1.25,.12,x,5.5,-8.55,screenMat,false);
  box(controlRoom,2.2,.08,.18,x,4.83,-8.45,roomTrim,false);
}
box(controlRoom,12,.55,2.2,0,1.05,2.0,roomTrim);
box(controlRoom,12,.16,2.3,0,1.42,2.0,mat('#26383d',.38,.45));
const controlButton=new THREE.Group();controlButton.position.set(0,1.54,2.15);controlRoom.add(controlButton);
cylinder(controlButton,.48,.52,.22,0,0,0,mat('#313d40',.4,.55),24);
cylinder(controlButton,.31,.36,.34,0,.25,0,mat('#a72c24',.32,.35),24);
cylinder(controlButton,.23,.27,.09,0,.46,0,mat('#f06b50',.24,.2),24);
for(let i=0;i<4;i++){
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),new THREE.MeshBasicMaterial({color:i%2?'#e2b45d':'#72d6c4'}));
  lamp.position.set(-4.5+i*3,1.58,1.1);controlRoom.add(lamp);
}
const roomLight=new THREE.PointLight(0x75aeb6,18,24);roomLight.position.set(0,6,1);controlRoom.add(roomLight);
const cinematicCloud=new THREE.Group();cinematicCloud.position.set(0,0,-43);scene.add(cinematicCloud);
const smokeMat=new THREE.MeshStandardMaterial({color:'#777d80',roughness:1,transparent:true,opacity:.92});
const cloudCore=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.5,5.5,18),smokeMat);cloudCore.position.y=3.2;cinematicCloud.add(cloudCore);
const cloudPuffs=[
 [-2.2,5.4,0,2.1],[-.7,6.1,.3,2.4],[1.1,6.4,0,2.5],[2.5,5.5,-.1,2.0],
 [-1.8,8,.1,2.2],[0,8.5,0,2.5],[1.9,8,.1,2.2],[-.8,10,.1,1.8],[.9,10.2,0,1.8],
 [-.1,11.5,0,1.35]
];
cloudPuffs.forEach(([x,y,z,r])=>{const puff=new THREE.Mesh(new THREE.SphereGeometry(r,18,14),smokeMat);puff.position.set(x,y,z);puff.scale.y=.72;cinematicCloud.add(puff);});
cinematicCloud.visible=false;controlRoom.visible=false;
let cinematicPhase='off',cinematicTime=0,countdownShown=5;
let militaryPhase='off';
function beginFinalCinematic(){
  if(militaryPhase!=='off'||!state.labVisited||state.researchStock<6){
    toast('Le projet Orion est encore verrouillé : réseau actif et 6 unités de recherche requises.');
    return;
  }
  militaryPhase='cinematic';cinematicPhase='ready';cinematicTime=0;countdownShown=5;
  $('cinematic-ui').classList.remove('hidden');
  $('cinematic-caption').textContent='SALLE DE CONTRÔLE · PROJET ORION';
  $('cinematic-instruction').textContent='Le dossier de recherche fictif est validé. La salle attend votre confirmation.';
  $('cinematic-action').textContent='APPUYER SUR LE BOUTON';$('cinematic-action').classList.remove('hidden');
  $('cinematic-countdown').textContent='';$('cinematic-glasses').classList.remove('on');$('cinematic-flash').classList.remove('active');
  scene.children.forEach(o=>{if(o!==controlRoom&&o!==cinematicCloud&&!o.isLight)o.visible=false;});
  controlRoom.visible=true;cinematicCloud.visible=false;avatar.visible=false;official.visible=false;
  scene.background=new THREE.Color('#071116');scene.fog=new THREE.Fog('#071116',30,100);
  camera.position.set(0,2.8,7.2);camera.lookAt(0,2.4,-8);
  $('pause-btn').classList.add('hidden');
}
function startCinematic(){
  if(cinematicPhase!=='ready')return;
  cinematicPhase='glasses';cinematicTime=0;
  $('cinematic-action').classList.add('hidden');
  $('cinematic-instruction').textContent='Le personnage ajuste ses lunettes de protection.';
  $('cinematic-glasses').classList.add('on');
}
function finishCinematic(){
  cinematicPhase='off';militaryPhase='site';
  $('cinematic-ui').classList.add('hidden');$('military-site').classList.remove('hidden');
  $('site-stock').textContent='PROJET ORION : ÉTAPE 1 VALIDÉE';
  controlRoom.visible=false;cinematicCloud.visible=false;militaryWorld.visible=true;official.visible=false;avatar.visible=true;
  scene.children.forEach(o=>{if(o!==avatar&&!o.isLight&&o!==militaryWorld&&o!==controlRoom&&o!==cinematicCloud)o.visible=false;});
  avatar.position.set(-39,0,30);avatar.rotation.y=0;
  scene.background=new THREE.Color('#b69a70');scene.fog=new THREE.Fog('#b69a70',35,5200);
  camera.position.set(8,8,13);camera.lookAt(0,1,0);
  toast('Secteur Orion débloqué. La campagne continue.');
}


// Console de progression : débloque l'événement final après les objectifs de campagne.
const researchConsole=new THREE.Group();researchConsole.position.set(-10,0,31);scene.add(researchConsole);
const consoleBody=mat('#26383b',.42,.55),consoleScreen=new THREE.MeshStandardMaterial({color:'#1a4650',emissive:'#1a9a9d',emissiveIntensity:1.25,metalness:.25,roughness:.3});
box(researchConsole,2.2,1.35,1.25,0,.68,0,consoleBody);
box(researchConsole,1.55,.78,.08,0,1.55,.63,consoleScreen,false);
box(researchConsole,2.35,.12,1.35,0,1.38,0,mat('#8c9b93',.35,.55));
cylinder(researchConsole,.12,.12,.08,-.65,1.48,.72,mat('#d7b45e',.35,.25),16);
const consoleLamp=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),new THREE.MeshBasicMaterial({color:0x6ed5c4}));
consoleLamp.position.set(.65,1.5,.72);researchConsole.add(consoleLamp);
const markers=[];
function marker(x,z,color=0xe1bd69){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.08,z);scene.add(ring);markers.push(ring);return ring;}
marker(-36,-43,0xe1bd69);marker(-20,-22,0xd4a85e);marker(-30,22,0xe4c078);marker(-12,22,0x6ed5c4);

let savedResearchStock=0;
try{savedResearchStock=Number(localStorage.getItem('nt-research-stock')||0)||0;}catch(e){}
const state={money:0,materials:0,energy:0,delivered:0,researchStock:savedResearchStock,centrifugeVisited:false,centrifugeRunning:false,centrifugeProgress:0,centrifugeBatch:0,labVisited:false,paused:true,started:false,won:false,near:null,mineTime:0};
const keys={};
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='e')interact();if(e.key==='Escape')togglePause();});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

$('lab-customizer').querySelectorAll('[data-component]').forEach(btn=>{
 btn.addEventListener('click',()=>{
   const type=btn.dataset.component,choice=btn.dataset.choice;
   selectedLabComponents[type]=choice;
   $('lab-customizer').querySelectorAll('[data-component="'+type+'"]').forEach(el=>el.classList.toggle('selected',el===btn));
   $('lab-selection-summary').textContent='Sélection : '+Object.values(selectedLabComponents).join(' · ');
 });
});
$('lab-apply').addEventListener('click',()=>{
   const screenColor=selectedLabComponents.console==='digital'?'#247d83':'#17434a';
   labScreens.forEach(screen=>screen.material.color.set(screenColor));
   interiorLight.intensity=selectedLabComponents.lighting==='bright'?24:18;
   toast('Configuration décorative enregistrée dans le laboratoire.');
});
$('lab-close').addEventListener('click',()=>{$('lab-customizer').classList.add('hidden');});

$('start-btn').addEventListener('click',()=>{state.started=true;state.paused=false;$('intro-screen').classList.add('hidden');toast('Bienvenue dans la campagne. Commence par explorer les gisements.');});
$('cinematic-action').addEventListener('click',()=>{if(cinematicPhase==='complete')finishCinematic();else startCinematic();});
$('pause-btn').addEventListener('click',togglePause);
$('resume-btn').addEventListener('click',togglePause);
$('continue-btn').addEventListener('click',()=>{$('win-screen').classList.add('hidden');state.won=false;toast('Tu peux continuer à développer ton réseau.');});
function togglePause(){if(!state.started)return;state.paused=!state.paused;$('pause-screen').classList.toggle('hidden',!state.paused);}
let toastTimer;
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function updateUI(){
 $('money').textContent=state.money.toLocaleString('fr-FR')+' €';$('materials').textContent=state.materials+' / 3';$('energy').textContent=state.energy+' MW';
 if(!state.delivered){$('mission-title').textContent='La mine à ciel ouvert';$('mission-copy').textContent='Approche les blocs et presse E pour extraire 3 unités de minerai d’uranium fictif.';$('progress-label').textContent=state.materials+' / 3 BLOCS EXTRAITS';$('progress-bar').style.width=(state.materials/3*100)+'%';$('mission-reward').textContent='RÉCOMPENSE : 500 €';}
 else if(!state.centrifugeVisited){$('mission-title').textContent='Le bâtiment centrifugeuse';$('mission-copy').textContent='Rejoins le bâtiment de recherche et découvre son installation scénographique.';$('progress-label').textContent='VISITE À EFFECTUER';$('progress-bar').style.width='45%';$('mission-reward').textContent='ÉTAPE DE RECHERCHE';}
 else if(!state.labVisited){$('mission-title').textContent='Le laboratoire rétro';$('mission-copy').textContent='Entre dans le laboratoire et observe la maquette fictive exposée sous vitrine.';$('progress-label').textContent='MAQUETTE À OBSERVER';$('progress-bar').style.width='70%';$('mission-reward').textContent='ÉTAPE DE RECHERCHE';}
 else {$('mission-title').textContent='Dossier Orion';$('mission-copy').textContent='Continue à livrer des ressources fictives et consulte le terminal de recherche.';$('progress-label').textContent=Math.min(state.researchStock,6)+' / 6 RESSOURCES';$('progress-bar').style.width=(Math.min(state.researchStock,6)/6*100)+'%';$('mission-reward').textContent=state.researchStock>=6?'TERMINAL DÉBLOQUÉ':'OBJECTIF DE RECHERCHE';}
 $('research-stock').textContent=state.researchStock+' UNITÉS';
 $('objective-chip').innerHTML='<span class="pulse"></span> OBJECTIF <b>'+(!state.delivered?'EXTRAIRE LES BLOCS':!state.centrifugeVisited?'VISITER LA CENTRIFUGEUSE':!state.labVisited?'VISITER LE LABORATOIRE':state.researchStock>=6?'REJOINDRE LE TERMINAL':'PRÉPARER LE DOSSIER ORION')+'</b>';
}
function closestTarget(){
 if(insideBunker){
   const exitDistance=avatar.position.distanceTo(new THREE.Vector3(SITE_LAYOUT.bunker.x,0,SITE_LAYOUT.bunker.z+4.4));
   return exitDistance<1.6?{type:'exitBunker',label:'SORTIR DU BUNKER'}:null;
 }
 if(insideCentrifuge){
   const exitDistance=avatar.position.distanceTo(new THREE.Vector3(270,0,8.0));
   if(exitDistance<1.45)return {type:'exitCentrifuge',label:'SORTIR DE LA CENTRALE'};
   const consoleDistance=avatar.position.distanceTo(new THREE.Vector3(270,0,-5.2));
   if(consoleDistance<2.8)return {type:'centrifugeStart',label:'LANCER LA SIMULATION'};
   return null;
 }
 if(insideLab){const exitDistance=avatar.position.distanceTo(new THREE.Vector3(240,0,5.8));return exitDistance<1.0?{type:'exitLab',label:'SORTIR DU LABORATOIRE'}:null;}
 let best=null,dist=3.1;
 const doorDistance=avatar.position.distanceTo(new THREE.Vector3(-36.8,0,26.2));
 if(doorDistance<2.4)return {type:'labDoor',label:'ENTRER DANS LE LABORATOIRE'};
 const plantDoorDistance=avatar.position.distanceTo(new THREE.Vector3(-19,0,-16.3));
 if(plantDoorDistance<2.1)return {type:'centrifugeEntrance',label:'ENTRER DANS LA CENTRALE'};
 const bunkerEntranceDistance=avatar.position.distanceTo(new THREE.Vector3(SITE_LAYOUT.bunker.x,0,SITE_LAYOUT.bunker.z+4.5));
 if(bunkerEntranceDistance<2.5)return {type:'bunkerEntrance',label:'ENTRER DANS LE BUNKER'};
 for(const b of mineBlocks)if(b.active){const p=b.mesh.getWorldPosition(new THREE.Vector3());const d=avatar.position.distanceTo(p);if(d<3.5&&d<dist){dist=d;best={type:'mineBlock',obj:b,label:'PIOCHER LE BLOC'};}}
 for(const [type,obj,label] of [['depot',depot,'LIVRER LES MATÉRIAUX'],['centrifugeBuilding',centrifugeBuilding,'VISITER LE BÂTIMENT CENTRIFUGEUSE'],['previewCase',previewCase,'OBSERVER LE PROTOTYPE FICTIF']]){
  const d=avatar.position.distanceTo(obj.position);if(d<3.8&&d<dist+1){dist=d;best={type,obj,label};}
 }
 const researchLabel=state.labVisited&&state.researchStock>=6?'OUVRIR LE DOSSIER ORION':'TERMINAL DE RECHERCHE — VERROUILLÉ';
 const rd=avatar.position.distanceTo(researchConsole.position);
 if(rd<4&&rd<dist+1){dist=rd;best={type:'research',obj:researchConsole,label:researchLabel};}
 return best;
}
function openCentrifugePanel(){
 $('centrifuge-panel').classList.remove('hidden');
 $('centrifuge-panel').setAttribute('aria-hidden','false');
 updateCentrifugeUI();
}
function closeCentrifugePanel(){
 $('centrifuge-panel').classList.add('hidden');
 $('centrifuge-panel').setAttribute('aria-hidden','true');
}
$('centrifuge-close').addEventListener('click',closeCentrifugePanel);
function updateCentrifugeUI(){
 const p=Math.min(1,state.centrifugeProgress);
 const u235=Math.round(7+p*5),u238=100-u235;
 $('u235-value').textContent=String(u235).padStart(2,'0');
 $('u238-value').textContent=String(u238).padStart(2,'0');
 $('u235-bar').style.width=u235+'%';$('u238-bar').style.width=u238+'%';
 $('centrifuge-percent').textContent=Math.round(p*100)+' %';
 $('centrifuge-progress-bar').style.width=(p*100)+'%';
 $('centrifuge-status').textContent=state.centrifugeRunning?'SIMULATION EN COURS':'CYCLE TERMINÉ';
 $('centrifuge-batch').textContent=state.centrifugeBatch+' UNITÉ(S) · CHARGE FICTIVE';
}
function interact(){
 if(!state.started||state.paused)return;
 if(!insideLab&&!insideCentrifuge&&!insideBunker&&!$('centrifuge-panel').classList.contains('hidden')){closeCentrifugePanel();return;}
 if(insideLab){exitLab();return;}
 const t=closestTarget();if(!t){toast('Aucune interaction à proximité.');return;}
 if(t.type==='exitBunker'){exitBunker();return;}
 if(t.type==='bunkerEntrance'){enterBunker();return;}
 if(t.type==='exitCentrifuge'){exitCentrifuge();return;}
 if(t.type==='centrifugeStart'){
   if(state.centrifugeRunning){toast('La simulation est déjà en cours.');return;}
   if(state.materials<=0){toast('Aucune ressource disponible : retourne extraire du minerai fictif.');return;}
   state.centrifugeBatch=state.materials;state.delivered+=state.centrifugeBatch;
   state.materials=0;hero.setCarrying(0);state.centrifugeProgress=0;state.centrifugeRunning=true;
   updateCentrifugeUI();updateUI();toast('Simulation lancée sur la centrifugeuse 3D.');return;
 }
 if(t.type==='labDoor'){enterLab();state.labVisited=true;updateUI();return;}
 if(t.type==='centrifugeEntrance'){state.centrifugeVisited=true;enterCentrifuge();updateUI();return;}
 if(t.type==='exitCentrifuge'){exitCentrifuge();return;}
 if(t.type==='mineBlock'){
  if(state.materials>=3){toast('Sac plein. Va déposer tes blocs au dépôt.');return;}
  t.obj.active=false;t.obj.mesh.visible=false;state.materials++;hero.setCarrying(state.materials);state.mineTime=.85;updateUI();toast('Bloc extrait : +1 minerai d’uranium fictif.');return;
 }
 if(t.type==='node'){
  if(state.materials>=3){toast('Tu as assez de minerai. Livre-le au dépôt.');return;}
  t.obj.active=false;t.obj.group.visible=false;state.materials++;hero.setCarrying(state.materials);state.mineTime=.72;updateUI();toast('Extraction terminée : +1 unité de minerai d’uranium fictif. '+state.materials+'/3.');return;
 }
 if(t.type==='centrifugeBuilding'){state.centrifugeVisited=true;enterCentrifuge();updateUI();return;}
 if(t.type==='previewCase'){state.labVisited=true;updateUI();toast('Laboratoire découvert : maquette fictive ajoutée au dossier.');return;}
 if(t.type==='depot'){
  if(state.materials===0){toast('Va d’abord extraire du minerai sur le petit gisement.');return;}
  const count=state.materials;state.materials=0;hero.setCarrying(0);state.delivered+=count;state.researchStock+=count;try{localStorage.setItem('nt-research-stock',String(state.researchStock));}catch(e){}state.money+=500;updateUI();toast('Livraison validée : +500 €. Bon travail !');return;
 }
 if(t.type==='research'){
  if(!state.labVisited||state.researchStock<6){toast('Projet verrouillé : visite le laboratoire et livre 6 unités de ressources au total.');return;}
  beginFinalCinematic();return;
 }
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();

const clock=new THREE.Clock();
let cameraYaw=Math.PI/4, cameraPitch=.42, cameraDistance=13, pointerLocked=false;
const cameraTarget=new THREE.Vector3();
canvas.addEventListener('click',()=>{if(state.started&&!state.paused&&militaryPhase!=='cinematic')canvas.requestPointerLock?.();});
document.addEventListener('pointerlockchange',()=>{pointerLocked=document.pointerLockElement===canvas;});
document.addEventListener('mousemove',e=>{if(!pointerLocked)return;cameraYaw-=e.movementX*.0025;cameraPitch=THREE.MathUtils.clamp(cameraPitch-e.movementY*.002,-.12,1.05);});
let walkTime=0;
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04),time=clock.elapsedTime;
 if(cinematicPhase==='complete'&&cinematicCloud.visible){cinematicCloud.scale.setScalar(1.2+Math.sin(time*.35)*.025);}
 if(militaryPhase==='cinematic'){
  cinematicTime+=dt;
  if(cinematicPhase==='glasses'&&cinematicTime>2.1){cinematicPhase='countdown';cinematicTime=0;$('cinematic-glasses').classList.add('on');$('cinematic-countdown').textContent='5';$('cinematic-instruction').textContent='Compte à rebours';}
  else if(cinematicPhase==='countdown'){
    const n=Math.max(0,5-Math.floor(cinematicTime));
    if(n!==countdownShown){countdownShown=n;$('cinematic-countdown').textContent=String(n);}
    if(cinematicTime>5.8){cinematicPhase='flash';cinematicTime=0;$('cinematic-flash').classList.add('active');cinematicCloud.visible=true;$('cinematic-instruction').textContent='Un éclat lumineux traverse l’horizon…';}
  } else if(cinematicPhase==='flash'&&cinematicTime>1.25){cinematicPhase='cloud';cinematicTime=0;$('cinematic-flash').classList.remove('active');$('cinematic-instruction').textContent='Le spectacle se dessine au loin.';}
  else if(cinematicPhase==='cloud'){
    const grow=Math.min(1,cinematicTime/6);
    cinematicCloud.scale.setScalar(.12+grow*1.08);
    cinematicCloud.position.y=-1.8+grow*1.8;
    if(cinematicTime>8){cinematicPhase='complete';$('cinematic-instruction').textContent='Séquence terminée. Le Secteur Orion vous attend.';$('cinematic-action').textContent='REJOINDRE LE SECTEUR ORION';$('cinematic-action').classList.remove('hidden');}
  }
  if(cinematicPhase==='ready'||cinematicPhase==='glasses'||cinematicPhase==='countdown'){camera.position.x=Math.sin(time*.25)*.035;camera.position.y=2.8+Math.sin(time*.5)*.018;camera.lookAt(0,2.4,-8);}
 }
 if(state.started&&!state.paused&&(militaryPhase==='off'||militaryPhase==='site')){
  let dx=0,dz=0;
  if(keys.arrowup)dz-=1;if(keys.arrowdown)dz+=1;if(keys.arrowleft)dx-=1;if(keys.arrowright)dx+=1;
  const moving=dx!==0||dz!==0;
  if(moving){
   const forwardX=-Math.sin(cameraYaw),forwardZ=-Math.cos(cameraYaw),rightX=Math.cos(cameraYaw),rightZ=-Math.sin(cameraYaw);
   const mx=rightX*dx+forwardX*(-dz), mz=rightZ*dx+forwardZ*(-dz), len=Math.hypot(mx,mz);
   const vx=mx/len, vz=mz/len;
   
   const oldX=avatar.position.x,oldZ=avatar.position.z;
   let nextX=oldX+vx*7*dt,nextZ=oldZ+vz*7*dt;
   if(insideBunker){
     nextX=THREE.MathUtils.clamp(nextX,SITE_LAYOUT.bunker.x-8.5,SITE_LAYOUT.bunker.x+8.5);
     nextZ=THREE.MathUtils.clamp(nextZ,SITE_LAYOUT.bunker.z-6.5,SITE_LAYOUT.bunker.z+5.9);
   }else if(insideCentrifuge){
     nextX=THREE.MathUtils.clamp(nextX,259.3,280.7);
     nextZ=THREE.MathUtils.clamp(nextZ,-8.4,8.1);
     const walls=[[259.0,281.0,-9.1,-8.75],[258.9,259.25,-8.7,8.7],[280.75,281.1,-8.7,8.7],[259.0,265.5,8.7,9.1],[274.5,281.0,8.7,9.1]];
     const hit=walls.some(([x1,x2,z1,z2])=>nextX+.42>x1&&nextX-.42<x2&&nextZ+.42>z1&&nextZ-.42<z2);
     if(hit){nextX=avatar.position.x;nextZ=avatar.position.z;}
   }else if(insideLab){
     nextX=THREE.MathUtils.clamp(nextX,232.2,247.8);
     nextZ=THREE.MathUtils.clamp(nextZ,-6.0,6.1);
     const interiorWalls=[[232.0,248.0,-6.65,-6.25],[231.8,232.2,-6.2,6.3],[247.8,248.2,-6.2,6.3],[232.0,238.9,6.25,6.65],[241.1,248.0,6.25,6.65]];
     const hit=interiorWalls.some(([x1,x2,z1,z2])=>nextX+.42>x1&&nextX-.42<x2&&nextZ+.42>z1&&nextZ-.42<z2);
     if(hit){nextX=avatar.position.x;nextZ=avatar.position.z;}
   }else{
     nextX=THREE.MathUtils.clamp(nextX,-84,84);
     nextZ=THREE.MathUtils.clamp(nextZ,-160,4065);
     // Collisions rectangulaires avec rayon du personnage : X puis Z pour glisser le long des murs.
     const playerRadius=.48;
     const siteWalls=[
       // Laboratoire principal, avec passage de porte réel.
       [-38.12,-25.88,17.88,18.12],
       [-38.12,-37.88,18.0,26.12],
       [-26.12,-25.88,18.0,26.12],
       [-38.0,-37.52,25.88,26.12],
       [-36.02,-26.0,25.88,26.12],
       ...(!labDoorPivot.userData.open?[[-37.55,-36.05,25.92,26.32]]:[]),
       // Annexes et bâtiments.
       [-27.12,-20.88,15.38,20.62],
       [-27.62,-22.38,24.88,29.12],
       [-28.62,-20.38,-28.12,-21.88],
       [-27.0,-22.0,-18.9,-14.1],
       [-22.2,-15.8,-21.75,-16.25],
       [-20.1,-15.9,27.55,30.45],
       // Installations industrielles.
       [-36.65,-33.35,-27.5,-24.0],
       [-32.15,-28.85,-27.5,-24.0],
       [-28.65,-20.35,-28.12,-21.88],
       [-26.9,-21.1,-19.0,-14.0],
       [SITE_LAYOUT.pointZero.x-3.4,SITE_LAYOUT.pointZero.x+3.4,SITE_LAYOUT.pointZero.z-3.4,SITE_LAYOUT.pointZero.z+3.4],
       [SITE_LAYOUT.bunker.x-5.8,SITE_LAYOUT.bunker.x-1.2,SITE_LAYOUT.bunker.z-4.3,SITE_LAYOUT.bunker.z+4.3],
       [SITE_LAYOUT.bunker.x+1.2,SITE_LAYOUT.bunker.x+5.8,SITE_LAYOUT.bunker.z-4.3,SITE_LAYOUT.bunker.z+4.3],
       [SITE_LAYOUT.bunker.x-5.8,SITE_LAYOUT.bunker.x+5.8,SITE_LAYOUT.bunker.z-4.3,SITE_LAYOUT.bunker.z-4.0],
       [SITE_LAYOUT.bunker.x-5.8,SITE_LAYOUT.bunker.x-1.2,SITE_LAYOUT.bunker.z+4.0,SITE_LAYOUT.bunker.z+4.3],
       [SITE_LAYOUT.bunker.x+1.2,SITE_LAYOUT.bunker.x+5.8,SITE_LAYOUT.bunker.z+4.0,SITE_LAYOUT.bunker.z+4.3],
       ...(!bunkerDoor.userData.open?[[SITE_LAYOUT.bunker.x-1.2,SITE_LAYOUT.bunker.x+1.2,SITE_LAYOUT.bunker.z+4.0,SITE_LAYOUT.bunker.z+4.3]]:[]),
       // Les anciens abris du plateau ont été supprimés : aucune collision fantôme.
     ];
     const overlaps=(x,z)=>siteWalls.some(([x1,x2,z1,z2])=>
       x+playerRadius>x1&&x-playerRadius<x2&&z+playerRadius>z1&&z-playerRadius<z2
     );
     const oldPos=avatar.position.clone();
     if(!overlaps(nextX,oldZ))avatar.position.x=nextX;
     if(!overlaps(avatar.position.x,nextZ))avatar.position.z=nextZ;
     for(const block of mineBlocks){
       if(!block.active)continue;
       const p=block.mesh.getWorldPosition(new THREE.Vector3());
       if(Math.abs(avatar.position.x-p.x)<1.45&&Math.abs(avatar.position.z-p.z)<1.45){
         avatar.position.x=oldPos.x;avatar.position.z=oldPos.z;break;
       }
     }
     nextX=avatar.position.x;nextZ=avatar.position.z;
   }
   avatar.position.x=nextX;avatar.position.z=nextZ;
   avatar.rotation.y=Math.atan2(vx,vz);
  }
  hero.update(dt,moving,7);
 }
 if(state.mineTime>0){if(!mineAnim&&!hero.isBusy()){hero.play('mine');mineAnim=true;}state.mineTime=Math.max(0,state.mineTime-dt);}else mineAnim=false;
 rotor.rotation.y+=dt*1.8;
 cRotor.rotation.y+=dt*(state.centrifugeRunning?8.5:1.4);
 interiorRotor.rotation.y+=dt*(state.centrifugeRunning?7.2:1.35);
 if(state.centrifugeRunning){
   state.centrifugeProgress=Math.min(1,state.centrifugeProgress+dt/24);
   updateCentrifugeUI();
   if(state.centrifugeProgress>=1){
     state.centrifugeRunning=false;
     state.researchStock+=state.centrifugeBatch;
     try{localStorage.setItem('nt-research-stock',String(state.researchStock));}catch(e){}
     updateCentrifugeUI();updateUI();
     toast('Simulation terminée : ressources fictives ajoutées au stock de recherche.');
   }
 }
 const smokePuffs=desertLandscape.userData.smokePuffs||[];
 smokePuffs.forEach((p,i)=>{
   const cycle=(time*.42+p.phase)%5;
   p.mesh.position.y=p.baseY+cycle*.9;
   p.mesh.position.x=p.baseX+Math.sin(time*.35+p.phase)*.42+cycle*.08;
   const scale=.65+cycle*.22;p.mesh.scale.set(scale,scale*1.15,scale);
   p.mesh.material.opacity=Math.max(.025,.24-cycle*.035);
 });
 exhibit.rotation.y+=dt*.18; exhibitRings.forEach((r,i)=>{r.rotation.x+=dt*(.12+i*.04);r.rotation.y+=dt*(.18+i*.05);});
 nodes.forEach((n,i)=>{if(n.active){n.crystal.position.y=1.05+Math.sin(time*2+i)*.08;n.crystal.rotation.y=time*.65;}});
 markers.forEach((m,i)=>{m.material.opacity=.5+Math.sin(time*2+i)*.25;m.scale.setScalar(1+Math.sin(time*2+i)*.05);});
 if(militaryPhase!=='cinematic'){
  cameraTarget.set(avatar.position.x,(insideLab||insideCentrifuge||insideBunker)?1.5:1.35,avatar.position.z);
  const horizontal=Math.cos(cameraPitch)*cameraDistance;
  const desired=new THREE.Vector3(
   avatar.position.x+Math.sin(cameraYaw)*horizontal,
   avatar.position.y+2.5+Math.sin(cameraPitch)*cameraDistance,
   avatar.position.z+Math.cos(cameraYaw)*horizontal
  );
  camera.position.lerp(desired,.12);camera.lookAt(cameraTarget);
 }
 const target=closestTarget();
 $('interaction').classList.toggle('visible',!!target&&state.started&&!state.paused);
 if(target)$('interaction-label').textContent=target.label;
 drawMinimap();
 renderer.render(scene,camera);
}
function drawMinimap(){
 const c=$('minimap'),ctx=c.getContext('2d'),w=c.width,h=c.height;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#18282a';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#50645b';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(90,0);ctx.lineTo(90,130);ctx.moveTo(0,66);ctx.lineTo(180,66);ctx.stroke();
 const map=(x,z)=>({x:90+x*.55,y:8+(z+60)*(114/4060)});
 [[depot,'#a8c8c1'],[centrifugeBuilding,'#d4a45e'],[previewCase,'#e4c078']].forEach(([o,col])=>{const p=map(o.position.x,o.position.z);ctx.fillStyle=col;ctx.fillRect(p.x-4,p.y-4,8,8);});
 mineBlocks.forEach(b=>{if(b.active){const p=map(-36+b.mesh.position.x,-43+b.mesh.position.z);ctx.fillStyle='#c6a16b';ctx.fillRect(p.x-2,p.y-2,4,4);}});
 const zero=map(SITE_LAYOUT.pointZero.x,SITE_LAYOUT.pointZero.z);ctx.fillStyle='#e35d4f';ctx.beginPath();ctx.arc(zero.x,zero.y,4,0,Math.PI*2);ctx.fill();
 const bunker=map(SITE_LAYOUT.bunker.x,SITE_LAYOUT.bunker.z);ctx.fillStyle='#6fc8bb';ctx.fillRect(bunker.x-4,bunker.y-4,8,8);ctx.strokeStyle='#d9b66b';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(zero.x,zero.y);ctx.lineTo(bunker.x,bunker.y);ctx.stroke();ctx.setLineDash([]);
 const p=map(avatar.position.x,avatar.position.z);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();
}
$('loading').classList.add('hidden');
updateUI();animate();
