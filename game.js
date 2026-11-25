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
 const crate=box(g,1.05,.85,1.05,0,.55,0,mat('#527d83',.5,.25));
 box(g,1.1,.08,1.1,0,1,0,mat('#c6a65c',.45,.3));
 const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.42),new THREE.MeshStandardMaterial({color:'#7fe0d3',emissive:'#1c6f69',emissiveIntensity:.6,metalness:.25,roughness:.25}));
 crystal.position.y=1.55;crystal.castShadow=true;g.add(crystal);
 nodes.push({group:g,crystal,active:true});
}

const avatar=new THREE.Group();scene.add(avatar);
const suit=mat('#d7d9d0',.65), dark=mat('#26383c',.7), visor=new THREE.MeshStandardMaterial({color:'#8bd0d0',metalness:.6,roughness:.18,emissive:'#16464a',emissiveIntensity:.35});
const body= new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,5,10),suit);body.position.y=1.35;body.castShadow=true;avatar.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.39,18,14),mat('#c69c78'));head.position.y=2.2;head.castShadow=true;avatar.add(head);
const helmet=new THREE.Mesh(new THREE.SphereGeometry(.43,18,12,0,Math.PI*2,0,Math.PI*.58),dark);helmet.position.y=2.3;helmet.castShadow=true;avatar.add(helmet);
const face=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),visor);face.position.set(0,2.19,.26);avatar.add(face);
const pack=box(avatar,.68,.88,.38,0,1.35,-.48,dark);
const arms=[],legs=[];
for(const side of [-1,1]){
 const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.65,4,8),suit);arm.position.set(side*.58,1.36,0);arm.rotation.z=side*-.18;arm.castShadow=true;avatar.add(arm);arms.push(arm);
 const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.62,4,8),dark);leg.position.set(side*.23,.48,0);leg.castShadow=true;avatar.add(leg);legs.push(leg);
}
avatar.position.set(-5,0,7);

const markers=[];
function marker(x,z,color=0xe1bd69){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.08,z);scene.add(ring);markers.push(ring);return ring;}
marker(0,1,0x8bd0c8);marker(-11,-7,0xe1bd69);marker(12,-7,0xd4a85e);

const state={money:0,materials:0,energy:0,delivered:0,bakeryOn:false,villageOn:false,paused:true,started:false,won:false,near:null};
const keys={};
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='e')interact();if(e.key==='Escape')togglePause();});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
$('start-btn').addEventListener('click',()=>{state.started=true;state.paused=false;$('intro-screen').classList.add('hidden');toast('Bienvenue à Valmont. Ton premier contrat commence.');});
$('pause-btn').addEventListener('click',togglePause);
$('resume-btn').addEventListener('click',togglePause);
$('continue-btn').addEventListener('click',()=>{$('win-screen').classList.add('hidden');state.won=false;toast('Tu peux continuer à développer ton réseau.');});
function togglePause(){if(!state.started)return;state.paused=!state.paused;$('pause-screen').classList.toggle('hidden',!state.paused);}
let toastTimer;
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function updateUI(){
 $('money').textContent=state.money.toLocaleString('fr-FR')+' €';$('materials').textContent=state.materials+' / 3';$('energy').textContent=state.energy+' MW';
 if(!state.delivered){$('mission-title').textContent='Le premier chantier';$('mission-copy').textContent='Récupère 3 caisses de minerai fictif près du dépôt.';$('progress-label').textContent=state.materials+' / 3 CAISSES';$('progress-bar').style.width=(state.materials/3*100)+'%';$('mission-reward').textContent='RÉCOMPENSE : 500 €';}
 else if(!state.bakeryOn){$('mission-title').textContent='Une première lumière';$('mission-copy').textContent='Retourne à la boulangerie et active son module énergétique.';$('progress-label').textContent='MODULE À INSTALLER';$('progress-bar').style.width='55%';$('mission-reward').textContent='COÛT : 250 €';}
 else if(!state.villageOn){$('mission-title').textContent='Voir plus grand';$('mission-copy').textContent='Alimente le village pour étendre ton réseau.';$('progress-label').textContent='1 / 2 ZONES ALIMENTÉES';$('progress-bar').style.width='70%';$('mission-reward').textContent='RÉCOMPENSE : 500 €';}
 else {$('mission-title').textContent='Valmont est éclairée';$('mission-copy').textContent='Ton premier réseau énergétique est opérationnel.';$('progress-label').textContent='CONTRAT TERMINÉ';$('progress-bar').style.width='100%';$('mission-reward').textContent='CHAPITRE 01 TERMINÉ';}
 $('objective-chip').innerHTML='<span class="pulse"></span> OBJECTIF <b>'+(!state.delivered?'COLLECTER DES MATÉRIAUX':!state.bakeryOn?'ACTIVER LA BOULANGERIE':!state.villageOn?'ALIMENTER LE VILLAGE':'EXPLORER LIBREMENT')+'</b>';
}
function closestTarget(){
 let best=null,dist=3.1;
 for(const n of nodes)if(n.active){const d=avatar.position.distanceTo(n.group.position);if(d<dist){dist=d;best={type:'node',obj:n,label:'RÉCUPÉRER LA CAISSE'};}}
 for(const [type,obj,label] of [['depot',depot,'LIVRER LES MATÉRIAUX'],['bakery',bakery,state.bakeryOn?'BOULANGERIE ALIMENTÉE':'INSTALLER LE MODULE (250 €)'],['village',village,state.villageOn?'VILLAGE ALIMENTÉ':'ALIMENTER LE VILLAGE (500 €)']]){
  const d=avatar.position.distanceTo(obj.position);if(d<3.8&&d<dist+1){dist=d;best={type,obj,label};}
 }
 return best;
}
function interact(){
 if(!state.started||state.paused)return;
 const t=closestTarget();if(!t){toast('Aucune interaction à proximité.');return;}
 if(t.type==='node'){
  if(state.materials>=3){toast('Tu as assez de matériaux. Livre-les au dépôt.');return;}
  t.obj.active=false;t.obj.group.visible=false;state.materials++;updateUI();toast('Caisse récupérée. '+state.materials+'/3 matériaux.');return;
 }
 if(t.type==='depot'){
  if(state.materials===0){toast('Récupère d’abord des caisses de matériaux.');return;}
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
 if(state.started&&!state.paused){
  let dx=0,dz=0;
  if(keys.z||keys.w||keys.arrowup)dz-=1;if(keys.s||keys.arrowdown)dz+=1;if(keys.q||keys.a||keys.arrowleft)dx-=1;if(keys.d||keys.arrowright)dx+=1;
  const moving=dx!==0||dz!==0;
  if(moving){const len=Math.hypot(dx,dz);dx/=len;dz/=len;avatar.position.x+=dx*7*dt;avatar.position.z+=dz*7*dt;avatar.position.x=THREE.MathUtils.clamp(avatar.position.x,-28,28);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z,-24,24);avatar.rotation.y=Math.atan2(dx,dz);walkTime+=dt*10;legs[0].rotation.x=Math.sin(walkTime)*.55;legs[1].rotation.x=-Math.sin(walkTime)*.55;arms[0].rotation.x=-Math.sin(walkTime)*.35;arms[1].rotation.x=Math.sin(walkTime)*.35;body.position.y=1.35+Math.abs(Math.sin(walkTime))*.05;}
  else{legs.forEach(l=>l.rotation.x=THREE.MathUtils.damp(l.rotation.x,0,8,dt));arms.forEach(a=>a.rotation.x=THREE.MathUtils.damp(a.rotation.x,0,8,dt));body.position.y=THREE.MathUtils.damp(body.position.y,1.35,8,dt);}
 }
 rotor.rotation.y+=dt*1.8;
 nodes.forEach((n,i)=>{if(n.active){n.crystal.position.y=1.55+Math.sin(time*2+i)*.12;n.crystal.rotation.y=time*.65;}});
 markers.forEach((m,i)=>{m.material.opacity=.5+Math.sin(time*2+i)*.25;m.scale.setScalar(1+Math.sin(time*2+i)*.05);});
 const desired=avatar.position.clone().add(camOffset);
 camera.position.lerp(desired,.07);camera.lookAt(avatar.position.x,1.15,avatar.position.z);
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
