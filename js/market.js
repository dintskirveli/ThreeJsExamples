var camera, scene, renderer, stats, container, controls, projector, composer;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var cylinderThing;

var WORLD_RADIUS = 1000;

init();
animate();

var vblur;

function init() {
	container = document.getElementById( 'container' );
	//document.body.appendChild(container);
	rendererSetup();
	scene = new THREE.Scene();
	mainCamSetup();

	new ConfigLoader("test2.json", scene).config();

	//floorSetup(scene);

	//lightsSetup();

	//test();
/*
	var bluriness = 10;

	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );

	hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	//hblur.renderToScreen = true;
	hblur.uniforms[ "h" ].value = bluriness / WIDTH;
	composer.addPass( hblur );

	vblur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	// set this shader pass to render to screen so we can see the effects
	vblur.renderToScreen = true;
	vblur.uniforms[ "v" ].value = bluriness / HEIGHT;
	composer.addPass( vblur );

	*/
	statsSetup();
	//controls = new THREE.OrbitControls( camera, renderer.domElement );
	projector = new THREE.Projector();
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

var CUR_INDEX = 0;

function update() {
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 100 * delta; // 100 pixels per second
	var rotateAngle = Math.PI / 4 * delta; 

	if ( keyboard.pressed("W") ) {
		console.log("ehrmergerd key pressed");
		cylinderThing.rotation.x -= rotateAngle;
	} else if ( keyboard.pressed("S") ) {
		console.log("ehrmergerd key pressed");
		cylinderThing.rotation.x += rotateAngle;
	} else if ( keyboard.pressed("P") ) {
		console.log(ALL_OBJECTS);
		/*for (var i in ALL_OBJECTS) {
			var vector = new THREE.Vector3();
	
			
		}*/
	}else if ( keyboard.pressed("T") ) {
		var start = { x : cylinderThing.rotation.x };
		var finish = { x : cylinderThing.rotation.x- Math.PI };

		var tween = new TWEEN.Tween(start).to(finish, 2000);
		tween.easing(TWEEN.Easing.Quartic.InOut)
		tween.onUpdate(function(){
		    cylinderThing.rotation.x = start.x
		});

		tween.start();
	}

	TWEEN.update();
	
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
	renderer.shadowMapEnabled = true;
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
	update();
	render();
	//composer.render();
	//controls.update();
}

function mainCamSetup() {
	camera = new THREE.PerspectiveCamera(30, getAspect(), 1, 10000);
	var y =  WORLD_RADIUS + 25
	camera.position.set(0,y, 0*-WORLD_RADIUS);
	//camera.position.set(0, 0, -500);

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 0, WORLD_RADIUS+200, -200 );
	console.log("lights...")
	spotLight.target.position.set( 0, WORLD_RADIUS, 0 );
	//spotLight.shadowCameraVisible = true;
	spotLight.castShadow = true;
	spotLight.intensity = 2;
	scene.add(spotLight)

	//camera.rotation.set(0,Math.PI/2,0);
	//camera.up = new THREE.Vector3(1,1,1);
	camera.up = new THREE.Vector3(0,1,0);
	camera.lookAt( new THREE.Vector3(0,y,1) );
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
//var BLUR = false;
function render() {

	//renderer.setViewport( 0, 0, w, h );
	//renderer.clear();
	renderer.render( scene, camera );
//	if (BLUR) {
//		composer.render()	
//	}
	
}

var _foreground_meshes = [];

function onDocumentMouseDown( event ) {

	event.preventDefault();

	console.log("ray casting...");
	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( ALL_OBJECTS );

	if ( intersects.length > 0 ) {
		var object = intersects[ 0 ].object.userData;
		console.log(object);
		_foreground_meshes = loadInspectionObject(object)
		console.log(_foreground_meshes)
		showInspectionHud(object)
	}
}

function showInspectionHud(object) {
	var hud = $('.inspectionHud')
	hud.find('#itemName').text(object.name)
	hud.find('#itemPrice').text('$'+object.price)
	hud.show();
}

function hideInspectionHud() {
	$('.inspectionHud').hide()
	for (index in _foreground_meshes) {
		camera.remove(_foreground_meshes[index]);
	}
	_foreground_meshes = []
}

function animateToDepartment(s) {
	var index = _departmentsToIndexes[s]
	animateToIndex(index);
}

function animateToIndex(index) {

	var stepBack = _intervalAngle/3
	var angle = -Math.PI/2-index*_intervalAngle + stepBack

	var start = { x : cylinderThing.rotation.x };
	var finish = { x : angle};

	var tween = new TWEEN.Tween(start).to(finish, 2000);
	tween.easing(TWEEN.Easing.Quartic.InOut)
	tween.onUpdate(function(){
	    cylinderThing.rotation.x = start.x
	});

	tween.start();	
}

function departmentClick(s) {
	animateToDepartment(s);
}