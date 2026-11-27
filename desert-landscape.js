// Grande map du site fictif : centrale compacte à l'ouest, laboratoire au sud-ouest,
// vaste terrain d'essai décoratif à l'est et bunker d'observation au sud.
export function createDesertLandscape(THREE, site, mat) {
  const world = new THREE.Group();
  world.name = 'DesertResearchSite';
  site.add(world);

  const box = (p,w,h,d,x,y,z,m,cast=true) => {
    const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
    o.position.set(x,y,z); o.castShadow=cast; o.receiveShadow=true; p.add(o); return o;
  };
  const cyl = (p,rTop,rBottom,h,x,y,z,m,n=16) => {
    const o=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBottom,h,n),m);
    o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; p.add(o); return o;
  };
  const sand=mat('#c99a62',1), pale=mat('#d8b47d',1), rock=mat('#89543d',1);
  const cliff=mat('#704536',1), concrete=mat('#777970',.92), roof=mat('#343b3a',.8);
  const metal=mat('#59615d',.62,.45), dark=mat('#252d2d',.78);
  const glass=new THREE.MeshStandardMaterial({color:'#8eaaa5',metalness:.2,roughness:.3});
  const worldFloor=new THREE.Mesh(new THREE.PlaneGeometry(180,160),sand);
  worldFloor.rotation.x=-Math.PI/2; worldFloor.position.y=-.06; worldFloor.receiveShadow=true; world.add(worldFloor);

  // Relief désertique en bordure de carte.
  for(let i=0;i<24;i++){
    const side=i%2===0?-1:1, x=side*(72+Math.random()*12);
    const h=9+Math.random()*15, w=7+Math.random()*12;
    const mesa=new THREE.Mesh(new THREE.CylinderGeometry(w*.72,w,h,5),i%3?rock:cliff);
    mesa.position.set(x,h/2-1,-68+i*5.5); mesa.scale.z=1.5; mesa.castShadow=true; world.add(mesa);
  }
  for(let i=0;i<100;i++){
    const x=(Math.random()-.5)*145,z=(Math.random()-.5)*125;
    const patch=new THREE.Mesh(new THREE.CircleGeometry(.3+Math.random()*1.1,6),i%4? pale:rock);
    patch.rotation.x=-Math.PI/2; patch.position.set(x,.002,z); patch.scale.set(1.8,.7,.6); world.add(patch);
  }

  // ZONE INDUSTRIELLE / MINIÈRE — à gauche, avec une centrale volontairement compacte.
  const plant=new THREE.Group(); plant.position.set(-28,0,-22); world.add(plant);
  const pad=box(plant,29,.28,23,0,.12,0,mat('#77796f'));
  box(plant,29.5,.12,23.5,0,.27,0,mat('#9a9a89'));
  // Deux petites tours de refroidissement stylisées, éléments de décor non fonctionnels.
  for(const x of [-8, -2]){
    const tower=new THREE.Group(); tower.position.set(x,0,-4); plant.add(tower);
    const shell=new THREE.Mesh(new THREE.CylinderGeometry(1.45,2.0,5.0,20,true),concrete);
    shell.position.y=2.5; shell.castShadow=true; tower.add(shell);
    cyl(tower,1.48,1.48,.22,0,4.95,0,roof,20);
    cyl(tower,1.15,1.15,.16,0,.18,0,dark,20);
  }
  // Bâtiments bas de la centrale, échelle réduite par rapport à l'ancienne version.
  const reactorHall=new THREE.Group(); reactorHall.position.set(4,0,-3); plant.add(reactorHall);
  box(reactorHall,10,3.5,7,0,1.75,0,concrete);
  box(reactorHall,10.5,.3,7.5,0,3.65,0,roof);
  box(reactorHall,4.2,1.65,.12,0,2.05,3.58,glass,false);
  for(let x=-1.8;x<=1.81;x+=1.2) box(reactorHall,.08,1.75,.16,x,2.05,3.66,dark);
  const annex= new THREE.Group(); annex.position.set(4,0,6); plant.add(annex);
  box(annex,6,2.5,5,0,1.25,0,mat('#8a8c80'));
  box(annex,6.3,.25,5.3,0,2.62,0,roof);
  for(const x of [-10,10]) box(plant,1.1,1.8,1.1,x,.9,0,metal);

  // Carrière en gradins, derrière la centrale : formes rocheuses uniquement.
  const quarry=new THREE.Group(); quarry.position.set(-34,0,-43); world.add(quarry);
  for(let tier=0;tier<4;tier++){
    const width=22-tier*3, depth=5.5;
    const berm=box(quarry,width,1.1,depth,0,.55+tier*1.05,-tier*5, tier%2?rock:cliff);
    berm.rotation.x=-.04;
  }
  for(let i=0;i<8;i++){
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.7+Math.random()*.7,0),rock);
    stone.position.set(-10+Math.random()*20,.4,-25-Math.random()*13);
    stone.scale.set(1.5,.8,1); quarry.add(stone);
  }

  // LABORATOIRE — secteur inférieur gauche, architecture rétro.
  const lab=new THREE.Group(); lab.position.set(-30,0,22); world.add(lab);
  box(lab,15,4.1,9,0,2.05,0,concrete);
  box(lab,15.5,.35,9.5,0,4.25,0,roof);
  box(lab,7,2.15,.12,0,2.25,4.58,glass,false);
  for(let x=-3.2;x<=3.21;x+=1.6) box(lab,.1,2.2,.18,x,2.25,4.66,dark);
  box(lab,1.5,2.5,.18,-5,1.25,4.66,dark);
  const labAnnex=new THREE.Group(); labAnnex.position.set(12,0,4); lab.add(labAnnex);
  box(labAnnex,7,3.1,6,0,1.55,0,mat('#8c9187'));
  box(labAnnex,7.4,.3,6.4,0,3.2,0,roof);
  // Petite cour et bâtiments annexes.
  box(lab,22,.12,18,7,.06,-1,mat('#77776c'));
  for(const [x,z] of [[-8,-5],[8,-5],[-8,7],[8,7]]){
    box(lab,2.2,1.4,2,x,.7,z,mat('#77796f'));
  }

  // TERRAIN D'ESSAI — grande plaine dégagée à droite, repères circulaires abstraits.
  const testGround=new THREE.Group(); testGround.position.set(28,0,-3); world.add(testGround);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(29,80),mat('#d2a36b',1));
  disc.rotation.x=-Math.PI/2; disc.position.y=.015; testGround.add(disc);
  for(const radius of [10,19,28]){
    const ring=new THREE.Mesh(new THREE.RingGeometry(radius-.07,radius+.07,96),mat('#9a7955',1));
    ring.rotation.x=-Math.PI/2; ring.position.y=.045; testGround.add(ring);
  }
  // Bornes et petits abris lointains : décor de jeu, sans équipement opérationnel.
  for(let i=0;i<20;i++){
    const a=i/20*Math.PI*2, r=31;
    const post=cyl(testGround,.09,.12,1.8,Math.cos(a)*r,.9,Math.sin(a)*r,metal,8);
    const marker=box(testGround,.55,.35,.12,Math.cos(a)*r,1.95,Math.sin(a)*r,mat('#d0b47e'));
    marker.rotation.y=-a;
  }
  const shelter=(x,z,rot=0)=>{
    const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; testGround.add(g);
    box(g,6,3.2,8,0,1.6,0,mat('#777c75'));
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.1,8,12,1,false,0,Math.PI),mat('#59635f'));
    cap.rotation.x=Math.PI/2; cap.position.set(0,3.1,0); g.add(cap);
    box(g,2.2,2,.12,0,1.1,4.05,dark);
  };
  shelter(22,-26,.4); shelter(48,18,-.5); shelter(45,-24,.2);

  // BUNKER D'OBSERVATION — au sud, séparé de la zone centrale.
  const bunker=new THREE.Group(); bunker.position.set(4,0,43); world.add(bunker);
  box(bunker,13,2.8,10,0,1.4,0,concrete);
  box(bunker,13.6,.5,10.6,0,2.95,0,roof);
  box(bunker,7,1.1,.12,0,1.85,5.06,glass,false);
  for(let x=-3.5;x<=3.51;x+=1.75) box(bunker,.1,1.25,.16,x,1.85,5.12,metal);
  for(let i=0;i<7;i++){
    const bag=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.62,4,8),mat('#9a865f',1));
    bag.rotation.z=Math.PI/2; bag.position.set(-4.8+i*1.35,.4,5.9); bunker.add(bag);
  }
  // Route de liaison courbe et pistes secondaires.
  const roadMat=mat('#9b805f',1);
  const road=(x,z,w,d,angle=0)=>{
    const r=box(world,w,.035,d,x,.005,z,roadMat,false); r.rotation.y=angle;
  };
  road(-9,1,34,3.2,-.35);
  road(1,14,3.2,29,.12);
  road(12,29,27,3.2,-.3);

  // Végétation rare et épaves décoratives pour donner l'échelle.
  for(let i=0;i<52;i++){
    const x=(Math.random()-.5)*145,z=(Math.random()-.5)*115;
    if((x<-14&&x>-48&&z>-48&&z<34)||(x>0&&z>-34&&z<28)) continue;
    const shrub=new THREE.Group(); shrub.position.set(x,0,z); world.add(shrub);
    const stem=cyl(shrub,.045,.07,.9,0,.45,0,mat('#70533a'),6);
    for(let j=0;j<3;j++){
      const twig=box(shrub,.06,.9,.06,0,.8,0,mat('#70533a'));
      twig.rotation.z=(j-1)*.65;
    }
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.35+Math.random()*.4,0),rock);
    stone.position.y=.18; stone.scale.set(1.5,.7,1); shrub.add(stone);
  }
  return world;
}
