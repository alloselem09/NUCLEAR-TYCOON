import { createCharacter } from './character.js';
import { createDesertLandscape } from './desert-landscape.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bb4b1);
scene.fog = new THREE.Fog(0x9bb4b1, 38, 105);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
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
function makeBuilding(x,z,w,h,d,wall,roof,label) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  box(g,w,h,d,0,h/2,0,mat(wall));
  box(g,w+0.25,0.35,d+0.25,0,h+0.17,0,mat(roof));
  for(let i=-1;i<=1;i++) box(g,0.65,0.9,0.08,i*w*0.25,h*0.48,d/2+0.045,mat('#a9c6c4',0.4,0.2),false);
  box(g,w*0.2,1.35,0.12,0,0.68,d/2+0.08,mat('#263a3d'));
  g.userData.label=label; return g;
}

const bakery = makeBuilding(-11, -7, 5.2, 3.4, 4.2, '#c9b99d', '#7c5442','BOULANGERIE');
const depot = makeBuilding(0, 1, 7, 4.2, 6, '#71858a', '#34474d','DÉPÔT');
const workshop = makeBuilding(12, -7, 6, 4.8, 6, '#8a9893', '#3c5353','ATELIER');
const village = makeBuilding(-13, 12, 5, 3.1, 4.5, '#c2b99f', '#8c6045','VILLAGE');

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
avatar.position.set(-5,0,7);
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
const labMat=mat('#9a9b8d'), labDark=mat('#343e3e');
const lab=box(militaryWorld,9,4.2,7,0,2.1,0,labMat);lab.position.set(3,2.1,-1);
box(militaryWorld,9.4,.3,7.4,3,4.35,-1,labDark);
for(let i=0;i<3;i++){box(militaryWorld,.12,1.5,.08,.8+i*2,2.2,2.55,mat('#283b40'));box(militaryWorld,1.3,.08,.08,1.4+i*2,2.2,2.62,mat('#d4b76f'));}
box(militaryWorld,2.2,2.5,.2,-1.2,1.25,2.62,labDark);
for(let i=0;i<7;i++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.45+Math.random()*.5,0),mat('#77684f'));rock.position.set(-10+Math.random()*27,.2,-10+Math.random()*20);militaryWorld.add(rock);}

// REPÈRE HISTORIQUE : tour stylisée inspirée de la silhouette de Trinity.
// Monument de décor uniquement, sans fonction technique.
const trinityTower=new THREE.Group();trinityTower.position.set(-13,0,-7);militaryWorld.add(trinityTower);
const towerMetal=mat('#555e5a',.62,.72), towerGold=mat('#9b895e',.7,.45);
const towerLevels=[0,2.3,4.6,6.9,9.2];
for(let level=0;level<towerLevels.length;level++){
  const y=towerLevels[level], half=2.15-level*.22;
  for(const sx of [-1,1]) for(const sz of [-1,1]){
    const post=cylinder(trinityTower,.055,.075,2.3, sx*half,y+1.15,sz*half,towerMetal,8);
    post.rotation.z=sx*.025;
  }
  if(level>0){
    const prev=2.15-(level-1)*.22;
    for(const side of [-1,1]){
      const brace=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,Math.hypot(2.3,Math.SQRT2*(prev-half)),8),towerGold);
      brace.position.set(side*(prev+half)/2,y-1.15,0);
      brace.rotation.z=Math.atan2(2.3,2*(prev-half));trinityTower.add(brace);
    }
  }
  const deck=box(trinityTower,half*2,.12,half*2,0,y,0,towerMetal,false);
  if(level===towerLevels.length-1) box(trinityTower,1.5,.45,1.5,0,y+.28,0,towerGold);
}
// Petites traverses décoratives sur les quatre faces.
for(let level=0;level<4;level++){
  const y=towerLevels[level]+1.15, half=2.15-level*.22, next=2.15-(level+1)*.22;
  for(const side of [-1,1]){
    const bar=box(trinityTower,half+next,.07,.07,0,y,side*(half+next)/2,towerMetal,false);
    const bar2=box(trinityTower,.07,.07,half+next,side*(half+next)/2,y,0,towerMetal,false);
  }
}
cylinder(trinityTower,.18,.18,.3,0,.15,0,towerMetal,12);

// Modules de recherche fictifs : accessoires visuels non fonctionnels.
const displayCapsules=new THREE.Group();displayCapsules.position.set(8,0,8);militaryWorld.add(displayCapsules);
const capsuleColors=['#78a7a0','#c4a66a','#8c91ad'];
capsuleColors.forEach((color,i)=>{
  const pod=new THREE.Group();pod.position.set(i*1.8,0,0);displayCapsules.add(pod);
  cylinder(pod,.42,.42,1.5,0,1.05,0,mat('#414d50',.38,.55),16);
  cylinder(pod,.45,.45,.18,0,1.82,0,mat(color,.3,.35),16);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(.42,16,10,0,Math.PI*2,0,Math.PI/2),mat(color,.3,.35));
  dome.position.y=1.9;pod.add(dome);
  box(pod,.9,.12,.9,0,.25,0,labDark);
});
// Nouveau décor principal : site désertique isolé, sans ville ni boulangerie.
const desertLandscape = createDesertLandscape(THREE, militaryWorld, mat);
militaryWorld.visible = true;
ground.visible = false;
grid.visible = false;
bakery.visible = false;
village.visible = false;
workshop.visible = false;
centrifuge.visible = false;
scene.children.forEach((object) => {
  if (object.userData?.legacyTree || object.name === 'legacyRoad') object.visible = false;
});
scene.background = new THREE.Color('#c58d5a');
scene.fog = new THREE.Fog('#c58d5a', 75, 165);


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
  if(militaryPhase!=='off'||!state.villageOn||state.researchStock<6){
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
  avatar.position.set(-8,0,5);avatar.rotation.y=0;
  scene.background=new THREE.Color('#b69a70');scene.fog=new THREE.Fog('#b69a70',35,100);
  camera.position.set(8,8,13);camera.lookAt(0,1,0);
  toast('Secteur Orion débloqué. La campagne continue.');
}


// Console de progression : débloque l'événement final après les objectifs de campagne.
const researchConsole=new THREE.Group();researchConsole.position.set(18,0,-1);scene.add(researchConsole);
const consoleBody=mat('#26383b',.42,.55),consoleScreen=new THREE.MeshStandardMaterial({color:'#1a4650',emissive:'#1a9a9d',emissiveIntensity:1.25,metalness:.25,roughness:.3});
box(researchConsole,2.2,1.35,1.25,0,.68,0,consoleBody);
box(researchConsole,1.55,.78,.08,0,1.55,.63,consoleScreen,false);
box(researchConsole,2.35,.12,1.35,0,1.38,0,mat('#8c9b93',.35,.55));
cylinder(researchConsole,.12,.12,.08,-.65,1.48,.72,mat('#d7b45e',.35,.25),16);
const consoleLamp=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),new THREE.MeshBasicMaterial({color:0x6ed5c4}));
consoleLamp.position.set(.65,1.5,.72);researchConsole.add(consoleLamp);
const markers=[];
function marker(x,z,color=0xe1bd69){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.08,z);scene.add(ring);markers.push(ring);return ring;}
marker(0,1,0x8bd0c8);marker(-11,-7,0xe1bd69);marker(12,-7,0xd4a85e);marker(18,-1,0x6ed5c4);

let savedResearchStock=0;
try{savedResearchStock=Number(localStorage.getItem('nt-research-stock')||0)||0;}catch(e){}
const state={money:0,materials:0,energy:0,delivered:0,researchStock:savedResearchStock,bakeryOn:false,villageOn:false,paused:true,started:false,won:false,near:null,mineTime:0};
const keys={};
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='e')interact();if(e.key==='Escape')togglePause();});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
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
 if(!state.delivered){$('mission-title').textContent='Le premier gisement';$('mission-copy').textContent='Explore le site et extrais 3 unités de minerai fictif avec ta pioche.';$('progress-label').textContent=state.materials+' / 3 EXTRACTIONS';$('progress-bar').style.width=(state.materials/3*100)+'%';$('mission-reward').textContent='RÉCOMPENSE : 500 €';}
 else if(!state.bakeryOn){$('mission-title').textContent='Une première lumière';$('mission-copy').textContent='Retourne à la boulangerie et active son module énergétique.';$('progress-label').textContent='MODULE À INSTALLER';$('progress-bar').style.width='45%';$('mission-reward').textContent='COÛT : 250 €';}
 else if(!state.villageOn){$('mission-title').textContent='Voir plus grand';$('mission-copy').textContent='Alimente le village pour développer ton réseau.';$('progress-label').textContent='RÉSEAU EN COURS';$('progress-bar').style.width='70%';$('mission-reward').textContent='RÉCOMPENSE : 500 €';}
 else {$('mission-title').textContent='Préparer le projet Orion';$('mission-copy').textContent='Le réseau est actif. Livre assez de ressources fictives puis rejoins le terminal de recherche.';$('progress-label').textContent=Math.min(state.researchStock,6)+' / 6 RESSOURCES';$('progress-bar').style.width=(Math.min(state.researchStock,6)/6*100)+'%';$('mission-reward').textContent=state.researchStock>=6?'TERMINAL DÉBLOQUÉ':'OBJECTIF DE RECHERCHE';}
 $('research-stock').textContent=state.researchStock+' UNITÉS';
 $('objective-chip').innerHTML='<span class="pulse"></span> OBJECTIF <b>'+(!state.delivered?'EXTRAIRE DES RESSOURCES':!state.bakeryOn?'ALIMENTER LA BOULANGERIE':!state.villageOn?'ALIMENTER LE VILLAGE':state.researchStock>=6?'REJOINDRE LE TERMINAL':'PRÉPARER LE PROJET ORION')+'</b>';
}
function closestTarget(){
 let best=null,dist=3.1;
 for(const n of nodes)if(n.active){const d=avatar.position.distanceTo(n.group.position);if(d<dist){dist=d;best={type:'node',obj:n,label:'MINER LE GISEMENT'};}}
 for(const [type,obj,label] of [['depot',depot,'LIVRER LES MATÉRIAUX'],['bakery',bakery,state.bakeryOn?'BOULANGERIE ALIMENTÉE':'INSTALLER LE MODULE (250 €)'],['village',village,state.villageOn?'VILLAGE ALIMENTÉ':'ALIMENTER LE VILLAGE (500 €)']]){
  const d=avatar.position.distanceTo(obj.position);if(d<3.8&&d<dist+1){dist=d;best={type,obj,label};}
 }
 const researchLabel=state.villageOn&&state.researchStock>=6?'OUVRIR LE PROJET ORION':'TERMINAL DE RECHERCHE — VERROUILLÉ';
 const rd=avatar.position.distanceTo(researchConsole.position);
 if(rd<4&&rd<dist+1){dist=rd;best={type:'research',obj:researchConsole,label:researchLabel};}
 return best;
}
function interact(){
 if(!state.started||state.paused)return;
 const t=closestTarget();if(!t){toast('Aucune interaction à proximité.');return;}
 if(t.type==='node'){
  if(state.materials>=3){toast('Tu as assez de minerai. Livre-le au dépôt.');return;}
  t.obj.active=false;t.obj.group.visible=false;state.materials++;hero.setCarrying(state.materials);state.mineTime=.72;updateUI();toast('Extraction terminée : +1 unité de minerai fictif. '+state.materials+'/3.');return;
 }
 if(t.type==='depot'){
  if(state.materials===0){toast('Va d’abord extraire du minerai sur le petit gisement.');return;}
  const count=state.materials;state.materials=0;hero.setCarrying(0);state.delivered+=count;state.researchStock+=count;try{localStorage.setItem('nt-research-stock',String(state.researchStock));}catch(e){}state.money+=500;updateUI();toast('Livraison validée : +500 €. Bon travail !');return;
 }
 if(t.type==='bakery'){
  if(state.bakeryOn){toast('La boulangerie est déjà alimentée.');return;}
  if(!state.delivered){toast('Termine d’abord la livraison au dépôt.');return;}
  if(state.money<250){toast('Il te faut 250 € pour installer le module.');return;}
  state.money-=250;state.bakeryOn=true;state.energy+=2;updateUI();toast('Boulangerie alimentée ! +2 MW au réseau.');return;
 }
 if(t.type==='village'){
  if(state.villageOn){toast('Le village est déjà alimenté.');return;}
  if(!state.bakeryOn){toast('Commence par alimenter la boulangerie.');return;}
  if(state.money<500){toast('Il te faut 500 €. Explore et livre des ressources au dépôt.');return;}
  state.money-=500;state.villageOn=true;state.energy+=5;updateUI();toast('Le réseau de Valmont est activé ! La campagne continue.');return;
 }
 if(t.type==='research'){
  if(!state.villageOn||state.researchStock<6){toast('Projet verrouillé : active le village et livre 6 unités de ressources au total.');return;}
  beginFinalCinematic();return;
 }
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();

const clock=new THREE.Clock();
const camOffset=new THREE.Vector3(9,9,11);
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
  if(moving){const len=Math.hypot(dx,dz);dx/=len;dz/=len;avatar.position.x+=dx*7*dt;avatar.position.z+=dz*7*dt;avatar.position.x=THREE.MathUtils.clamp(avatar.position.x,-28,28);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z,-24,24);avatar.rotation.y=Math.atan2(dx,dz);}
  hero.update(dt,moving,7);
 }
 if(state.mineTime>0){if(!mineAnim&&!hero.isBusy()){hero.play('mine');mineAnim=true;}state.mineTime=Math.max(0,state.mineTime-dt);}else mineAnim=false;
 rotor.rotation.y+=dt*1.8;
 nodes.forEach((n,i)=>{if(n.active){n.crystal.position.y=1.05+Math.sin(time*2+i)*.08;n.crystal.rotation.y=time*.65;}});
 markers.forEach((m,i)=>{m.material.opacity=.5+Math.sin(time*2+i)*.25;m.scale.setScalar(1+Math.sin(time*2+i)*.05);});
 if(militaryPhase!=='cinematic'){const desired=militaryPhase==='site'?new THREE.Vector3(8,8,13):avatar.position.clone().add(camOffset);camera.position.lerp(desired,.07);camera.lookAt(militaryPhase==='site'?new THREE.Vector3(0,1,0):new THREE.Vector3(avatar.position.x,1.15,avatar.position.z));}
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
 const map=(x,z)=>({x:90+x*2.15,y:65+z*2.15});
 [[depot,'#a8c8c1'],[bakery,state.bakeryOn?'#e4c078':'#d4a45e'],[village,state.villageOn?'#e4c078':'#d4a45e'],[workshop,'#879c9a']].forEach(([o,col])=>{const p=map(o.position.x,o.position.z);ctx.fillStyle=col;ctx.fillRect(p.x-4,p.y-4,8,8);});
 nodes.forEach(n=>{if(n.active){const p=map(n.group.position.x,n.group.position.z);ctx.fillStyle='#79d7c8';ctx.fillRect(p.x-2,p.y-2,4,4);}});
 const p=map(avatar.position.x,avatar.position.z);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();
}
$('loading').classList.add('hidden');
updateUI();animate();
