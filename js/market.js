var camera, scene, renderer, stats, container, controls, projector;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

init();
animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild(container);

	scene = new THREE.Scene();
	mainCamSetup();

	new ConfigLoader("test.json", scene).config();

	floorSetup(scene);

	lightsSetup();

	rendererSetup();
	statsSetup();
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	projector = new THREE.Projector();
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

function lightsSetup() {
	var light = new THREE.AmbientLight( "white" );
	scene.add( light );
}

function rendererSetup() {
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.setSize(WIDTH, HEIGHT);
  	//renderer.shadowMapEnabled = true;
	//renderer.autoClear = false;
	renderer.setClearColor( "black", 1 );
	container.appendChild(renderer.domElement);
}

function statsSetup() {
	window.addEventListener( 'resize', onWindowResize, false );
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
}

function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
	controls.update();
}

function mainCamSetup() {
	camera = new THREE.PerspectiveCamera(30, getAspect(), 1, 10000);
	camera.position.set(0, 20, 150);
	camera.rotation.set(0,0,0);
	scene.add(camera);
}

function getAspect() {
	return WIDTH/HEIGHT;
}

function onWindowResize() {
  	camera.aspect = getAspect();
  	camera.updateProjectionMatrix();
  	renderer.setSize( WIDTH, HEIGHT );
  	render();
}

function render() {

	//renderer.setViewport( 0, 0, w, h );
	//renderer.clear();
	renderer.render( scene, camera );
}

function onDocumentMouseDown( event ) {

	event.preventDefault();
	console.log("ray casting...");
	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( ALL_OBJECTS );

	if ( intersects.length > 0 ) {
		console.log(intersects[ 0 ]);
		/*
		intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

		var particle = new THREE.Sprite( particleMaterial );
		particle.position = intersects[ 0 ].point;
		particle.scale.x = particle.scale.y = 16;
		scene.add( particle );
	*/

	}

	/*
	// Parse all the faces
	for ( var i in intersects ) {

		intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

	}
	*/
}