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
  const g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  cylinder(g,0.16*s,0.23*s,1.5*s,0,0.75*s,0,mat('#66523c'),9);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(1.0*s,2.4*s,8),mat('#385c48'));
  crown.position.y=2.35*s; crown.castShadow=true; g.add(crown);
}
for(let i=0;i<44;i++){ const x=(Math.random()-.5)*66,z=(Math.random()-.5)*58; if(Math.abs(x)<18&&Math.abs(z)<16)continue; makeTree(x,z,.65+Math.random()*.7); }

function road(x,z,w,d) {
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,.06,d),mat('#555d5a'));
  m.position.set(x,-.015,z); m.receiveShadow=true; scene.add(m);
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

// PERSONNAGE PRINCIPAL — modèle 3D inspiré de la référence fournie
const avatar=new THREE.Group();scene.add(avatar);
const orange=mat('#e87516',.72), orangeDark=mat('#a9470e',.78), navy=mat('#101b20',.82), bootMat=mat('#080d10',.8), gloveMat=mat('#171c1e',.8);
const skin=mat('#56372a',.9), helmetMat=mat('#f18a18',.48), yellow=mat('#f5c84c',.48), reflective=mat('#d7e1d9',.32,.18);
const lens=new THREE.MeshStandardMaterial({color:'#101b20',metalness:.5,roughness:.2});
const jacket=new THREE.Group(); jacket.position.y=1.42; avatar.add(jacket);
const torso=box(jacket,.86,.88,.48,0,0,0,orange);
box(jacket,.9,.13,.505,0,.19,0,yellow);
box(jacket,.9,.055,.51,0,.11,0,reflective);
box(jacket,.9,.13,.505,0,-.18,0,yellow);
box(jacket,.9,.05,.51,0,-.25,0,reflective);
box(jacket,.12,.82,.025,-.25,0,.252,yellow);
box(jacket,.12,.82,.025,.25,0,.252,yellow);
box(jacket,.08,.82,.03,0,0,.26,orangeDark);
box(jacket,.22,.12,.035,0,.34,.27,orangeDark);
for(const x of [-.34,.34]){const button=cylinder(jacket,.035,.035,.025,x,.31,.27,gloveMat,10);button.rotation.x=Math.PI/2;}
const neck=cylinder(avatar,.16,.17,.18,0,1.94,0,skin,12);
const head=new THREE.Group();head.position.set(0,2.18,.015);avatar.add(head);
const faceShape=new THREE.Mesh(new THREE.SphereGeometry(.32,18,14),skin);faceShape.scale.set(1,.98,.86);faceShape.castShadow=true;head.add(faceShape);
const faceMask=box(head,.43,.23,.12,0,-.045,.255,gloveMat);
const goggleFrame=box(head,.48,.16,.09,0,.055,.285,orangeDark);
box(head,.19,.105,.025,-.12,.055,.34,lens);
box(head,.19,.105,.025,.12,.055,.34,lens);
box(head,.06,.055,.035,0,.055,.345,mat('#e7a33c'));
const helmet=new THREE.Mesh(new THREE.SphereGeometry(.39,20,14,0,Math.PI*2,0,Math.PI*.52),helmetMat);
helmet.position.y=.22;helmet.scale.set(1.08,.82,1);helmet.castShadow=true;head.add(helmet);
box(head,.92,.075,.48,0,.12,.015,helmetMat);
box(head,.16,.08,.08,0,.02,.37,yellow);
const packGroup=new THREE.Group();packGroup.position.set(0,1.42,-.34);avatar.add(packGroup);
box(packGroup,.62,.78,.3,0,0,-.08,navy);
box(packGroup,.48,.16,.32,0,.32,-.08,mat('#26383b'));
box(packGroup,.12,.58,.07,-.34,0,.13,orangeDark);
box(packGroup,.12,.58,.07,.34,0,.13,orangeDark);
box(packGroup,.34,.2,.08,0,-.12,-.245,mat('#35464a'));
const arms=[],legs=[];
for(const side of [-1,1]){
 const arm=new THREE.Group();arm.position.set(side*.5,1.73,0);avatar.add(arm);arms.push(arm);
 const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.145,.17,.62,10),orange);sleeve.position.y=-.31;sleeve.castShadow=true;arm.add(sleeve);
 const upperStripe=box(arm,.29,.085,.31,0,-.22,0,yellow);
 box(arm,.29,.045,.315,0,-.27,0,reflective);
 const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.13,.14,.13,10),orangeDark);cuff.position.y=-.59;arm.add(cuff);
 const glove=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),gloveMat);glove.position.y=-.7;arm.add(glove);
 const leg=new THREE.Group();leg.position.set(side*.23,.98,0);avatar.add(leg);legs.push(leg);
 const trousers=new THREE.Mesh(new THREE.CylinderGeometry(.17,.145,.78,10),navy);trousers.position.y=-.39;trousers.castShadow=true;leg.add(trousers);
 const knee=box(leg,.3,.16,.23,0,-.37,.015,mat('#17262b'));
 const boot=box(leg,.34,.2,.48,0,-.82,.08,bootMat);
 box(leg,.34,.055,.49,0,-.72,.08,mat('#4b5553'));
}
const pickaxe=new THREE.Group();pickaxe.position.set(.02,-.77,.08);arms[1].add(pickaxe);
const handle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.92,8),mat('#5a3822'));handle.rotation.z=-.12;pickaxe.add(handle);
const pickHead=box(pickaxe,.72,.095,.12,0,.4,0,mat('#687579',.38,.65));
const pickTip=new THREE.Mesh(new THREE.ConeGeometry(.09,.28,8),mat('#687579',.38,.65));pickTip.rotation.z=Math.PI/2;pickTip.position.x=.43;pickaxe.add(pickTip);
avatar.position.set(-5,0,7);

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
militaryWorld.visible=false;
let militaryPhase='off', dialogueIndex=0, officialWalk=0;
const dialogueLines=[
 ['VISITEUR','Bonsoir. Je représente un service de l’État. Nous avons suivi votre travail à Valmont.'],
 ['LE VISITEUR','Nous vous proposons de prendre la direction d’un petit site expérimental isolé. Vous aurez votre propre laboratoire et une équipe réduite.'],
 ['VOUS','Et qu’attendez-vous de moi ?'],
 ['LE VISITEUR','Explorer un programme de recherche entièrement fictif. Les résultats de vos essais détermineront la suite de votre financement. Alors, vous acceptez ?']
];
function showDialogue(){const line=dialogueLines[dialogueIndex];$('dialogue-speaker').textContent=line[0];$('dialogue-text').textContent=line[1];$('dialogue-next').innerHTML=(dialogueIndex===dialogueLines.length-1?'ACCEPTER LA PROPOSITION':'CONTINUER')+' <span>↗</span>';}
function beginMilitary(){state.started=true;state.paused=false;militaryPhase='arrival';official.visible=true;officialWalk=0;avatar.position.set(-5,0,7);$('intro-screen').classList.add('hidden');$('military-dialogue').classList.remove('hidden');$('dialogue-card');$('dialogue-next').disabled=true;$('dialogue-speaker').textContent='';$('dialogue-text').textContent='Un homme en costume arrive sur le site de Valmont…';}
function acceptMilitary(){militaryPhase='site';$('military-dialogue').classList.add('hidden');scene.children.forEach(o=>{if(o!==avatar&&o!==official&&!o.isLight&&o!==militaryWorld)o.visible=false;});militaryWorld.visible=true;official.visible=true;official.position.set(-5,0,5);official.rotation.y=Math.PI;avatar.position.set(-8,0,5);avatar.rotation.y=0;scene.background=new THREE.Color('#b69a70');scene.fog=new THREE.Fog('#b69a70',35,100);camera.position.set(3,9,16);camera.lookAt(0,1,0);$('military-site').classList.remove('hidden');$('pause-btn').classList.add('hidden');}


const markers=[];
function marker(x,z,color=0xe1bd69){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.08,z);scene.add(ring);markers.push(ring);return ring;}
marker(0,1,0x8bd0c8);marker(-11,-7,0xe1bd69);marker(12,-7,0xd4a85e);

const state={money:0,materials:0,energy:0,delivered:0,bakeryOn:false,villageOn:false,paused:true,started:false,won:false,near:null,mineTime:0};
const keys={};
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='e')interact();if(e.key==='Escape')togglePause();});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
$('start-btn').addEventListener('click',()=>{state.started=true;state.paused=false;$('intro-screen').classList.add('hidden');toast('Bienvenue à Valmont. Ton premier contrat commence.');});
$('military-btn').addEventListener('click',beginMilitary);
$('dialogue-next').addEventListener('click',()=>{if(militaryPhase!=='dialogue')return;if(dialogueIndex<dialogueLines.length-1){dialogueIndex++;showDialogue();}else acceptMilitary();});
$('pause-btn').addEventListener('click',togglePause);
$('resume-btn').addEventListener('click',togglePause);
$('continue-btn').addEventListener('click',()=>{$('win-screen').classList.add('hidden');state.won=false;toast('Tu peux continuer à développer ton réseau.');});
function togglePause(){if(!state.started)return;state.paused=!state.paused;$('pause-screen').classList.toggle('hidden',!state.paused);}
let toastTimer;
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function updateUI(){
 $('money').textContent=state.money.toLocaleString('fr-FR')+' €';$('materials').textContent=state.materials+' / 3';$('energy').textContent=state.energy+' MW';
 if(!state.delivered){$('mission-title').textContent='Le premier gisement';$('mission-copy').textContent='Explore le petit site minier et extrais 3 unités de minerai fictif avec E.';$('progress-label').textContent=state.materials+' / 3 EXTRACTIONS';$('progress-bar').style.width=(state.materials/3*100)+'%';$('mission-reward').textContent='RÉCOMPENSE : 500 €';}
 else if(!state.bakeryOn){$('mission-title').textContent='Une première lumière';$('mission-copy').textContent='Retourne à la boulangerie et active son module énergétique.';$('progress-label').textContent='MODULE À INSTALLER';$('progress-bar').style.width='55%';$('mission-reward').textContent='COÛT : 250 €';}
 else if(!state.villageOn){$('mission-title').textContent='Voir plus grand';$('mission-copy').textContent='Alimente le village pour étendre ton réseau.';$('progress-label').textContent='1 / 2 ZONES ALIMENTÉES';$('progress-bar').style.width='70%';$('mission-reward').textContent='RÉCOMPENSE : 500 €';}
 else {$('mission-title').textContent='Valmont est éclairée';$('mission-copy').textContent='Ton premier réseau énergétique est opérationnel.';$('progress-label').textContent='CONTRAT TERMINÉ';$('progress-bar').style.width='100%';$('mission-reward').textContent='CHAPITRE 01 TERMINÉ';}
 $('objective-chip').innerHTML='<span class="pulse"></span> OBJECTIF <b>'+(!state.delivered?'COLLECTER DES MATÉRIAUX':!state.bakeryOn?'ACTIVER LA BOULANGERIE':!state.villageOn?'ALIMENTER LE VILLAGE':'EXPLORER LIBREMENT')+'</b>';
}
function closestTarget(){
 let best=null,dist=3.1;
 for(const n of nodes)if(n.active){const d=avatar.position.distanceTo(n.group.position);if(d<dist){dist=d;best={type:'node',obj:n,label:'MINER LE GISEMENT'};}}
 for(const [type,obj,label] of [['depot',depot,'LIVRER LES MATÉRIAUX'],['bakery',bakery,state.bakeryOn?'BOULANGERIE ALIMENTÉE':'INSTALLER LE MODULE (250 €)'],['village',village,state.villageOn?'VILLAGE ALIMENTÉ':'ALIMENTER LE VILLAGE (500 €)']]){
  const d=avatar.position.distanceTo(obj.position);if(d<3.8&&d<dist+1){dist=d;best={type,obj,label};}
 }
 return best;
}
function interact(){
 if(!state.started||state.paused)return;
 const t=closestTarget();if(!t){toast('Aucune interaction à proximité.');return;}
 if(t.type==='node'){
  if(state.materials>=3){toast('Tu as assez de minerai. Livre-le au dépôt.');return;}
  t.obj.active=false;t.obj.group.visible=false;state.materials++;state.mineTime=.72;updateUI();toast('Extraction terminée : +1 unité de minerai fictif. '+state.materials+'/3.');return;
 }
 if(t.type==='depot'){
  if(state.materials===0){toast('Va d’abord extraire du minerai sur le petit gisement.');return;}
  const count=state.materials;state.materials=0;state.delivered+=count;state.money+=500;updateUI();toast('Livraison validée : +500 €. Bon travail !');return;
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
  if(state.money<500){toast('Il te faut 500 €. Explore et livre des caisses au dépôt.');return;}
  state.money-=500;state.villageOn=true;state.energy+=5;updateUI();$('win-screen').classList.remove('hidden');state.paused=true;toast('Le réseau de Valmont est activé !');return;
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
 if(militaryPhase==='arrival'){officialWalk=Math.min(1,officialWalk+dt*.22);official.position.x=15-(20*officialWalk);official.position.z=9-(2*officialWalk);official.rotation.y=-1.1+officialWalk*.7;if(officialWalk>=1){militaryPhase='dialogue';$('dialogue-next').disabled=false;dialogueIndex=0;showDialogue();}}
 if(state.started&&!state.paused&&militaryPhase!=='site'){
  let dx=0,dz=0;
  if(keys.arrowup)dz-=1;if(keys.arrowdown)dz+=1;if(keys.arrowleft)dx-=1;if(keys.arrowright)dx+=1;
  const moving=dx!==0||dz!==0;
  if(moving){const len=Math.hypot(dx,dz);dx/=len;dz/=len;avatar.position.x+=dx*7*dt;avatar.position.z+=dz*7*dt;avatar.position.x=THREE.MathUtils.clamp(avatar.position.x,-28,28);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z,-24,24);avatar.rotation.y=Math.atan2(dx,dz);walkTime+=dt*10;legs[0].rotation.x=Math.sin(walkTime)*.55;legs[1].rotation.x=-Math.sin(walkTime)*.55;arms[0].rotation.x=-Math.sin(walkTime)*.35;arms[1].rotation.x=Math.sin(walkTime)*.35;jacket.position.y=1.42+Math.abs(Math.sin(walkTime))*.035;}
  else{legs.forEach(l=>l.rotation.x=THREE.MathUtils.damp(l.rotation.x,0,8,dt));arms.forEach(a=>a.rotation.x=THREE.MathUtils.damp(a.rotation.x,0,8,dt));jacket.position.y=THREE.MathUtils.damp(jacket.position.y,1.42,8,dt);}
 }
 if(state.mineTime>0){state.mineTime=Math.max(0,state.mineTime-dt);const swing=1-state.mineTime/.72;arms[1].rotation.x=-Math.sin(swing*Math.PI)*1.9;arms[1].rotation.z=-.18;pickaxe.rotation.z=-Math.sin(swing*Math.PI)*.55;}
 else{arms[1].rotation.z=THREE.MathUtils.damp(arms[1].rotation.z,0,9,dt);pickaxe.rotation.z=THREE.MathUtils.damp(pickaxe.rotation.z,0,9,dt);}
 rotor.rotation.y+=dt*1.8;
 nodes.forEach((n,i)=>{if(n.active){n.crystal.position.y=1.05+Math.sin(time*2+i)*.08;n.crystal.rotation.y=time*.65;}});
 markers.forEach((m,i)=>{m.material.opacity=.5+Math.sin(time*2+i)*.25;m.scale.setScalar(1+Math.sin(time*2+i)*.05);});
 const desired=militaryPhase==='site'?new THREE.Vector3(8,8,13):avatar.position.clone().add(camOffset);
 camera.position.lerp(desired,.07);camera.lookAt(militaryPhase==='site'?new THREE.Vector3(0,1,0):new THREE.Vector3(avatar.position.x,1.15,avatar.position.z));
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
