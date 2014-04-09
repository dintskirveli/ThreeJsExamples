var container;
var camera, controls, scene, renderer;

init();
animate();

function init() {
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 100;
	camera.position.y = 20;

	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	controls.target.set(7.625/2,0,0);
	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog("black");

	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/floor_tile.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 100, 100 );
	var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	//floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);

	var cereals = new THREE.Geometry();
	var cereal = new THREE.Mesh( new THREE.CubeGeometry(7.625,11,2.75) );

	for (var i = 0; i < 10; i++) {
		cereal.position.set(0,11/2,-i*4);
		THREE.GeometryUtils.merge( cereals, cereal );
	}
	var materials = [
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_left.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_right.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_top.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_bottom.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_front.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_back.jpg') } ) 
	];
	var cerealsMesh = new THREE.Mesh(cereals, new THREE.MeshFaceMaterial(materials));
	cerealsMesh.castShadow = true;
	cerealsMesh.receiveShadow = true;
	scene.add(cerealsMesh);

	var soupGeom = new THREE.Geometry();
	var soupLids = new THREE.Geometry();

	//var soupLid = new THREE.Mesh(circleGeometry(2,60));
	var soupLid = new THREE.Mesh(new THREE.CircleGeometry(2,60));
	//soupLid.rotation.set(Math.PI,0,0);
	var soup = new THREE.Mesh( new THREE.CylinderGeometry( 2, 2, 4.5, 60, 1, true ));

	var yRot = 0;
	var x = 0;
	var xoff = 7;

	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 5; j++) {
			x = xoff+j*4.5;
			yRot = Math.random() * Math.PI;
			soup.position.set(x,4.5/2,-5*i);
			soup.rotation.set(0, yRot, 0);
			THREE.GeometryUtils.merge( soupGeom, soup );

			soupLid.position.set(x,4.5,-5*i);
			soupLid.rotation.set(3*Math.PI/2,0,yRot);
			THREE.GeometryUtils.merge( soupLids, soupLid );

			soupLid.position.set(x,0,-5*i);
			//soupLid.rotation.set(0,yRot,0);
			THREE.GeometryUtils.merge( soupLids, soupLid );
		}
	}
	
	var soupLidMesh = new THREE.Mesh(soupLids, new THREE.MeshPhongMaterial( { map: loadAndRender('images/soup_top.jpg') } ));
	soupLidMesh.castShadow = true;
	soupLidMesh.receiveShadow = true;
	scene.add(soupLidMesh);
	
	var soupCanMesh = new THREE.Mesh(soupGeom, new THREE.MeshPhongMaterial( { map: loadAndRender('images/soup.jpg') } ));
	soupCanMesh.castShadow = true;
	soupCanMesh.receiveShadow = true;
	scene.add(soupCanMesh);
/*
	light = new THREE.AmbientLight( "white" );
	scene.add( light );
	*/
	var light = new THREE.SpotLight("white");
	light.position.set(-30,30,30);
	light.castShadow = true;
	light.shadowCameraVisible = true;
	scene.add(light);

	light = new THREE.SpotLight("white");
	light.position.set(45,30,-100);
	light.castShadow = true;
	light.shadowCameraVisible = true;
	scene.add(light);
	

	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		alert("No WebGL support detected");

	//renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( "black", 1 );
  	renderer.setSize( window.innerWidth, window.innerHeight );
  	renderer.shadowMapEnabled = true;

  	container = document.getElementById( 'container' );
  	container.appendChild( renderer.domElement );
  	window.addEventListener( 'resize', onWindowResize, false );

  	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
}

function onWindowResize() {

  	camera.aspect = window.innerWidth / window.innerHeight;
  	camera.updateProjectionMatrix();

  	renderer.setSize( window.innerWidth, window.innerHeight );
  	render();
}

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	stats.update();
}

function render() {
	renderer.render( scene, camera );
}

function loadAndRender(filename) {
	return THREE.ImageUtils.loadTexture(filename, {}, render);
}
