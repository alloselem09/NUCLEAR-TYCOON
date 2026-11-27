// Décor désertique du complexe de recherche — éléments purement visuels.
export function createDesertLandscape(THREE, site, mat) {
  const world = new THREE.Group();
  world.name = 'DesertResearchSite';
  site.add(world);

  const box = (parent,w,h,d,x,y,z,material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
  };
  const cylinder = (parent,r,h,x,y,z,material,segments=12) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material);
    m.position.set(x,y,z); m.castShadow=true; parent.add(m); return m;
  };
  const desert = mat('#a97845',1), redRock=mat('#754536',1), sand=mat('#c49a62',1);
  const concrete=mat('#77776d',.92), roof=mat('#343b3a',.8), dark=mat('#252d2d',.75);
  const glass=new THREE.MeshStandardMaterial({color:'#8eaaa5',metalness:.25,roughness:.25});
  const metal=mat('#555d59',.65,.55);

  // Terrain ocre, avec plaques de terre craquelée stylisées.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(170,170),desert);
  floor.rotation.x=-Math.PI/2; floor.position.y=-.045; floor.receiveShadow=true; world.add(floor);
  for(let i=0;i<95;i++){
    const x=(Math.random()-.5)*125, z=(Math.random()-.5)*115;
    const patch=new THREE.Mesh(new THREE.CircleGeometry(.35+Math.random()*1.25,6),i%3===0?redRock:sand);
    patch.rotation.x=-Math.PI/2; patch.position.set(x,.002,z); patch.scale.set(1.5,.7,.55); world.add(patch);
  }

  // Laboratoire rétro, façade vitrée et toiture plate.
  const lab=new THREE.Group(); lab.position.set(17,0,12); world.add(lab);
  box(lab,12,4.3,8,0,2.15,0,concrete);
  box(lab,12.5,.35,8.5,0,4.45,0,roof);
  box(lab,5.5,2.1,.12,0,2.35,4.08,glass);
  for(let x=-2.8;x<=2.81;x+=1.4) box(lab,.09,2.2,.18,x,2.35,4.12,dark);
  box(lab,1.5,2.4,.18,-4.2,1.2,4.12,dark);
  for(let x=-4;x<=4;x+=2) box(lab,1.4,.09,.9,x,.95,-1.5,roof);

  // Hangar isolé : grand volume fermé, portes coulissantes décoratives.
  const hangar=new THREE.Group(); hangar.position.set(-19,0,17); world.add(hangar);
  box(hangar,17,6.5,12,0,3.25,0,mat('#77766b',.9));
  box(hangar,17.6,.4,12.6,0,6.55,0,roof);
  box(hangar,7,5.2,.18,0,2.6,6.08,dark);
  for(let x=-3.3;x<=3.31;x+=1.1) box(hangar,.08,5.1,.2,x,2.6,6.2,metal);
  box(hangar,1.8,.18,.25,0,5.5,6.34,metal);
  for(let x=-6;x<=6;x+=3) box(hangar,1.4,.35,.5,x,6.78,0,metal);

  // Bunker d'observation, bas et semi-enterré, avec meurtrière panoramique.
  const bunker=new THREE.Group(); bunker.position.set(0,0,-48); world.add(bunker);
  box(bunker,14,3.2,10,0,1.6,0,concrete);
  box(bunker,14.5,.55,10.5,0,3.3,0,roof);
  box(bunker,8,1.2,.12,0,2.0,5.06,glass);
  for(let x=-3.8;x<=3.81;x+=1.9) box(bunker,.12,1.35,.18,x,2.0,5.1,metal);
  for(let i=0;i<8;i++){
    const bag= new THREE.Mesh(new THREE.CapsuleGeometry(.42,.7,4,8),mat('#9a865f',1));
    bag.rotation.z=Math.PI/2; bag.position.set(-5.8+(i%4)*1.35,.45+Math.floor(i/4)*.48,6.0); bunker.add(bag);
  }

  // Repères lointains : mesas en silhouettes rocheuses.
  for(let i=0;i<13;i++){
    const w=8+Math.random()*15, h=7+Math.random()*17, d=7+Math.random()*12;
    const mesa=new THREE.Mesh(new THREE.CylinderGeometry(w*.72,w,h,5),i%2?redRock:mat('#8a5740',1));
    mesa.position.set(-75+i*12,h/2-1,-62-Math.random()*12);
    mesa.scale.z=d/w; mesa.castShadow=true; world.add(mesa);
  }

  // Buissons secs et arbres morts, sans végétation verte.
  for(let i=0;i<70;i++){
    const x=(Math.random()-.5)*105, z=(Math.random()-.5)*95;
    if(Math.abs(x)<13 && Math.abs(z)<13) continue;
    const shrub=new THREE.Group(); shrub.position.set(x,0,z); world.add(shrub);
    const twig=mat('#6d5238',1);
    for(let j=0;j<4;j++){
      const branch=cylinder(shrub,.045,.07,.8,0,.35,0,twig,6);
      branch.rotation.z=(j-1.5)*.48; branch.rotation.x=(j-1.5)*.22;
    }
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.35+Math.random()*.35,0),redRock);
    stone.position.y=.2; stone.scale.set(1.5,.65,1); shrub.add(stone);
  }

  // Quelques accessoires d'échelle abandonnés, purement décoratifs.
  for(const [x,z] of [[-38,3],[34,26],[-31,-29]]){
    const vehicle=new THREE.Group(); vehicle.position.set(x,0,z); world.add(vehicle);
    box(vehicle,3.4,1.15,1.8,0,.85,0,mat('#625d4c',.95));
    box(vehicle,1.4,.7,1.65,-.2,1.65,0,mat('#777365',.9));
    for(const wx of [-1.1,1.1]) for(const wz of [-1,1]) cylinder(vehicle,.38,.35,wx,.38,wz,mat('#292b29'),12);
  }

  // Poteaux et panneaux d'échelle non techniques.
  for(let i=0;i<6;i++){
    const z=-24+i*9;
    cylinder(world,.09,2.1,-39,.0,z,metal,8);
    box(world,1.4,.65,.12,-39,2.0,z,mat('#b7a16d',.8));
  }
  return world;
}
