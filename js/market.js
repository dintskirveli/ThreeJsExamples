var camera, scene, renderer, stats, container, controls;
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