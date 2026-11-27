// Carte 3D du complexe désertique : zone industrielle compacte au nord-ouest,
// laboratoire au sud-ouest, grand plateau ouvert à l'est et bunker au sud.
// Les éléments sont des décors de jeu fictifs, sans fonctions opérationnelles.
export function createDesertLandscape(THREE, site, mat, layout={pointZero:{x:28,z:-3},bunker:{x:28,z:997}}) {
  const world = new THREE.Group();
  world.name = 'DesertResearchSite';
  site.add(world);

  const box=(p,w,h,d,x,y,z,m,cast=true)=>{
    const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
    o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;p.add(o);return o;
  };
  const cyl=(p,rt,rb,h,x,y,z,m,n=16)=>{
    const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);
    o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;
  };
  const sand=mat('#c99a62',1), pale=mat('#dfbd89',1), ochre=mat('#b98553',1);
  const rock=mat('#89543d',1), cliff=mat('#704536',1);
  const concrete=mat('#777970',.92), roof=mat('#343b3a',.8);
  const metal=mat('#59615d',.62,.45), dark=mat('#252d2d',.78);
  const glass=new THREE.MeshStandardMaterial({color:'#8eaaa5',metalness:.2,roughness:.3});

  const floor=new THREE.Mesh(new THREE.PlaneGeometry(180,1250),sand);
  floor.rotation.x=-Math.PI/2;floor.position.set(0,-.06,450);floor.receiveShadow=true;world.add(floor);

  // Relief rocheux en périphérie : falaises en strates, sans fermer le terrain jouable.
  for(let i=0;i<30;i++){
    const side=i%2===0?-1:1;
    const x=side*(70+Math.random()*8);
    const h=10+Math.random()*13,w=7+Math.random()*10;
    const mesa=new THREE.Mesh(new THREE.CylinderGeometry(w*.72,w,h,5),i%3?rock:cliff);
    mesa.position.set(x,h/2-1,-72+i*4.9);
    mesa.scale.z=1.35;mesa.castShadow=true;mesa.receiveShadow=true;world.add(mesa);
  }
  for(let i=0;i<18;i++){
    const x=-78+i*9,z=-76+Math.sin(i*.7)*5;
    const h=8+(i%4)*2.5,w=7+(i%3)*2;
    const mesa=new THREE.Mesh(new THREE.CylinderGeometry(w*.7,w,h,5),i%2?rock:cliff);
    mesa.position.set(x,h/2-1,z);mesa.scale.z=1.25;mesa.castShadow=true;world.add(mesa);
  }
  for(let i=0;i<125;i++){
    const x=(Math.random()-.5)*150,z=(Math.random()-.5)*130;
    const patch=new THREE.Mesh(new THREE.CircleGeometry(.35+Math.random()*1.1,6),i%5? pale:ochre);
    patch.rotation.x=-Math.PI/2;patch.position.set(x,.002,z);
    patch.scale.set(1.8,.7,.6);world.add(patch);
  }

  // ROUTES : pistes sableuses larges et courbes entre les quartiers.
  const roadMat=mat('#a98259',1);
  const road=(x,z,w,d,angle=0)=>{
    const r=box(world,w,.045,d,x,.006,z,roadMat,false);r.rotation.y=angle;
  };
  road(-7,-9,46,4,-.32);
  road(-1,7,4,35,.12);
  road(17,20,39,4,-.22);
  road(4,38,28,3,.12);
  // Longue piste de liaison vers le bunker, situé à 1 000 m du Point Zéro dans l'échelle du jeu.
  road(layout.pointZero.x,(layout.pointZero.z+layout.bunker.z)/2,4,Math.hypot(layout.bunker.x-layout.pointZero.x,layout.bunker.z-layout.pointZero.z),Math.atan2(layout.bunker.x-layout.pointZero.x,layout.bunker.z-layout.pointZero.z));

  // ZONE INDUSTRIELLE / MINIÈRE — compacte, dans le quadrant supérieur gauche.
  const plant=new THREE.Group();plant.position.set(-28,0,-22);world.add(plant);
  box(plant,27,.28,21,0,.12,0,mat('#77796f'));
  box(plant,27.5,.12,21.5,0,.27,0,mat('#9a9a89'));
  for(const x of [-7,-2.5]){
    const tower=new THREE.Group();tower.position.set(x,0,-3.7);plant.add(tower);
    const shell=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.55,4.0,20,true),concrete);
    shell.position.y=2;shell.castShadow=true;tower.add(shell);
    cyl(tower,1.2,1.2,.18,0,3.95,0,roof,20);
    cyl(tower,.95,.95,.14,0,.15,0,dark,20);
  }
  const hall=new THREE.Group();hall.position.set(3.5,0,-3);plant.add(hall);
  box(hall,8,3,6,0,1.5,0,concrete);
  box(hall,8.4,.28,6.4,0,3.14,0,roof);
  box(hall,3.6,1.4,.12,0,1.9,3.08,glass,false);
  for(let x=-1.5;x<=1.51;x+=1)box(hall,.08,1.5,.16,x,1.9,3.16,dark);
  const annex=new THREE.Group();annex.position.set(4,0,5.5);plant.add(annex);
  box(annex,5.5,2.2,4.5,0,1.1,0,mat('#8a8c80'));
  box(annex,5.8,.22,4.8,0,2.3,0,roof);
  box(plant,3.2,1.6,2.8,-9,.8,5,mat('#8a8c80'));
  box(plant,3.4,.2,3,-9,1.7,5,roof);
  for(const x of [-10,10])box(plant,.85,1.5,.85,x,.75,0,metal);


  // Fumée décorative animée au-dessus des deux tours de la centrale.
  const smokePuffs=[];
  for(const sx of [-35,-30.5]){
    for(let i=0;i<9;i++){
      const puff=new THREE.Mesh(
        new THREE.SphereGeometry(.55+(i%3)*.18,10,8),
        new THREE.MeshStandardMaterial({color:'#8a8b86',transparent:true,opacity:.2,depthWrite:false,roughness:1})
      );
      puff.position.set(sx+(Math.random()-.5)*.45,4+i*1.35,-25.7+(Math.random()-.5)*.4);
      puff.scale.set(1,1.15,1);
      world.add(puff);
      smokePuffs.push({mesh:puff,baseY:4+i*1.35,phase:i*.7+(sx+40)*.3,baseX:sx});
    }
  }
  world.userData.smokePuffs=smokePuffs;

  // CARRIÈRE EN GRADINS — derrière la zone industrielle.
  const quarry=new THREE.Group();quarry.position.set(-34,0,-43);world.add(quarry);
  for(let tier=0;tier<4;tier++){
    const width=22-tier*3,depth=5;
    const berm=box(quarry,width,1.15,depth,0,.55+tier*1.0,-tier*4.8,tier%2?rock:cliff);
    berm.rotation.x=-.035;
  }
  for(let i=0;i<15;i++){
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.55+Math.random()*.65,0),rock);
    stone.position.set(-10+Math.random()*20,.35,-23-Math.random()*13);
    stone.scale.set(1.5,.8,1);quarry.add(stone);
  }
  // Petits engins purement décoratifs, pour donner l'échelle de la carrière.
  for(const [x,z] of [[-11,-9],[8,-10],[12,4],[-8,7]]){
    const vehicle=new THREE.Group();vehicle.position.set(x,.15,z);quarry.add(vehicle);
    box(vehicle,2.6,.75,1.35,0,.65,0,mat('#b58a43'));
    box(vehicle,1.05,.65,1.1,-.25,1.3,0,mat('#6c7770'));
    for(const wx of [-.8,.8])for(const wz of [-.55,.55])cyl(vehicle,.24,.24,.18,wx,.32,wz,dark,10);
  }

  // LABORATOIRE — quartier inférieur gauche, style béton années 1940-50.
  const lab=new THREE.Group();lab.position.set(-30,0,22);world.add(lab);
  box(lab,19,.12,17,0,.06,0,mat('#77776c'));
  const mainLab=new THREE.Group();mainLab.position.set(-2,0,0);lab.add(mainLab);
  // Murs séparés avec une véritable ouverture pour la porte d'entrée.
  box(mainLab,12,3.8,.22,0,1.9,-3.9,concrete);
  box(mainLab,.22,3.8,8,-5.9,1.9,0,concrete);
  box(mainLab,.22,3.8,8,5.9,1.9,0,concrete);
  box(mainLab,.48,3.8,.22,-5.76,1.9,3.9,concrete);
  box(mainLab,10.02,3.8,.22,.99,1.9,3.9,concrete);
  box(mainLab,12.5,.32,8.5,0,3.95,0,roof);
  box(mainLab,6.4,2,.12,0,2.05,4.08,glass,false);
  for(let x=-2.8;x<=2.81;x+=1.4)box(mainLab,.1,2.05,.18,x,2.05,4.16,dark);
  box(mainLab,1.55,.18,.24,-4.8,.12,4.16,dark);
  box(mainLab,.16,2.4,.22,-5.55,1.2,4.16,roof);
  box(mainLab,.16,2.4,.22,-4.05,1.2,4.16,roof);
  const annexLab=new THREE.Group();annexLab.position.set(6,0,-4);lab.add(annexLab);
  box(annexLab,6,2.7,5,0,1.35,0,mat('#8c9187'));
  box(annexLab,6.3,.25,5.3,0,2.78,0,roof);
  const service=new THREE.Group();service.position.set(5,0,5);lab.add(service);
  box(service,5,2.4,4,0,1.2,0,mat('#8c9187'));
  box(service,5.3,.25,4.3,0,2.52,0,roof);
  for(const [x,z] of [[-8,-5],[8,-5],[-8,6],[8,6]]){
    box(lab,1.7,1.1,1.6,x,.55,z,mat('#77796f'));
  }

  // GRAND PLATEAU EST : espace de jeu largement dégagé, avec seulement quelques repères.
  const plateau=new THREE.Group();plateau.position.set(28,0,-3);world.add(plateau);
  const plateauFloor=new THREE.Mesh(new THREE.CircleGeometry(34,80),mat('#d2a36b',1));
  plateauFloor.rotation.x=-Math.PI/2;plateauFloor.position.y=.012;plateau.add(plateauFloor);
  // Petits repères irréguliers et discrets en bordure, sans cercles concentriques ni mesures.
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2,r=33;
    const post=cyl(plateau,.07,.1,1.15,Math.cos(a)*r,.58,Math.sin(a)*r,metal,8);
    const cap=box(plateau,.38,.24,.1,Math.cos(a)*r,1.22,Math.sin(a)*r,mat('#c4a879'));
    cap.rotation.y=-a;
  }
  // Quelques abris de service visuellement sobres, repoussés vers les bords.
  const shelter=(x,z,rot=0)=>{
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;plateau.add(g);
    box(g,4.5,2.6,6,0,1.3,0,mat('#777c75'));
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,6,12,1,false,0,Math.PI),mat('#59635f'));
    cap.rotation.x=Math.PI/2;cap.position.set(0,2.5,0);g.add(cap);
    box(g,1.8,1.7,.12,0,.95,3.05,dark);
  };
  shelter(-7,-27,.4);shelter(20,24,-.5);shelter(29,-23,.2);
  for(const [x,z] of [[-25,10],[24,11],[0,-29]]){
    const wreck=new THREE.Group();wreck.position.set(x,0,z);plateau.add(wreck);
    box(wreck,2.5,.65,1.25,0,.55,0,mat('#6d705f'));
    box(wreck,1.1,.5,1.1,-.2,1.05,0,mat('#858778'));
    for(const wx of [-.8,.8])for(const wz of [-.48,.48])cyl(wreck,.2,.2,.16,wx,.28,wz,dark,10);
  }

  // BUNKER D'OBSERVATION — au sud du plateau, visible depuis le laboratoire.
  const bunker=new THREE.Group();bunker.position.set(layout.bunker.x,0,layout.bunker.z);world.add(bunker);
  box(bunker,12,.3,9,0,.15,0,mat('#6f716a'));
  box(bunker,11,2.5,8,0,1.4,0,concrete);
  box(bunker,11.5,.45,8.5,0,2.85,0,roof);
  box(bunker,6.2,1.05,.12,0,1.75,4.06,glass,false);
  for(let x=-3;x<=3.01;x+=1.5)box(bunker,.1,1.2,.16,x,1.75,4.12,metal);
  for(let i=0;i<6;i++){
    const bag=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.55,4,8),mat('#9a865f',1));
    bag.rotation.z=Math.PI/2;bag.position.set(-3.8+i*1.25,.38,4.9);bunker.add(bag);
  }

  // Falaises au fond de la vallée allongée, au-delà du bunker éloigné.
  for(let i=0;i<18;i++){
    const x=-78+i*9,z=1060+Math.sin(i*.7)*5;
    const h=8+(i%4)*2.5,w=7+(i%3)*2;
    const mesa=new THREE.Mesh(new THREE.CylinderGeometry(w*.7,w,h,5),i%2?rock:cliff);
    mesa.position.set(x,h/2-1,z);mesa.scale.z=1.25;mesa.castShadow=true;world.add(mesa);
  }

  // Végétation très clairsemée, uniquement sur les marges de la carte.
  for(let i=0;i<48;i++){
    const x=(Math.random()-.5)*145,z=(Math.random()-.5)*120;
    if((x<-15&&x>-48&&z>-51&&z<35)||(x>0&&z>-38&&z<31))continue;
    const shrub=new THREE.Group();shrub.position.set(x,0,z);world.add(shrub);
    cyl(shrub,.045,.07,.8,0,.4,0,mat('#70533a'),6);
    for(let j=0;j<3;j++){
      const twig=box(shrub,.055,.75,.055,0,.7,0,mat('#70533a'));
      twig.rotation.z=(j-1)*.65;
    }
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.32+Math.random()*.32,0),rock);
    stone.position.y=.16;stone.scale.set(1.5,.7,1);shrub.add(stone);
  }
  return world;
}
