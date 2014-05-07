var camera, scene, renderer, container, projector, composer;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var cylinderThing;

var WORLD_RADIUS = 1000;

init();
animate();

function init() {
	container = document.getElementById( 'container' );
	rendererSetup();
	scene = new THREE.Scene();
	mainCamSetup();

	new ConfigLoader("test2.json", scene).config();

	projector = new THREE.Projector();
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

var CUR_INDEX = 0;
var TWEENING = false

function tweenCallback() {
	console.log("done tweening"); 
	TWEENING = false;
}

function update() {

	TWEEN.update();

	if (_inHud) {
		return;
	}

	if ( keyboard.pressed("N") ) {
		if (!TWEENING) {
			TWEENING = true;
			CUR_INDEX++;
			if (CUR_INDEX >= _numberOfDepartments) {
				CUR_INDEX = 0;
			}
			animateToIndex(CUR_INDEX, tweenCallback);
		}
	} else if ( keyboard.pressed("P") ) {
		if (!TWEENING) {
			TWEENING = true;
			CUR_INDEX--;
			if (CUR_INDEX < 0) {
				CUR_INDEX = _numberOfDepartments-1;
			}
			animateToIndex(CUR_INDEX, tweenCallback);
		}
	}

	
}

function lightsSetup() {
	var light = new THREE.AmbientLight( "white" );
	scene.add( light );
}

function rendererSetup() {
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.setSize(window.innerWidth, window.innerHeight);
  	renderer.shadowMapEnabled = true;
	//renderer.autoClear = false;
	renderer.setClearColor( "black", 1 );
	container.appendChild(renderer.domElement);
	renderer.shadowMapEnabled = true;
}

function animate() {
	requestAnimationFrame( animate );
	update();
	render();
}

function mainCamSetup() {
	camera = new THREE.PerspectiveCamera(30, getAspect(), 1, 10000);
	var y =  WORLD_RADIUS + 25
	camera.position.set(0,y, 0);
	//camera.position.set(0, 0, -500);

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 0, WORLD_RADIUS+200, -200 );
	console.log("lights...")
	spotLight.target.position.set( 0, WORLD_RADIUS, 0 );

	spotLight.castShadow = true;
	spotLight.intensity = 2;
	scene.add(spotLight)

	camera.up = new THREE.Vector3(0,1,0);
	camera.lookAt( new THREE.Vector3(0,y,1) );
	scene.add(camera);
}

function getAspect() {
	return window.innerWidth/window.innerHeight;
}

function onWindowResize() {
  	camera.aspect = getAspect();
  	camera.updateProjectionMatrix();
  	renderer.setSize( window.innerWidth, window.innerHeight );
  	render();
}

function render() {
	renderer.render( scene, camera );
}

var _foreground_meshes = [];

var _inHud = false;
var _rotationMouseDown = false;
var _mouseX = 0
var _mouseY = 0;

function onDocumentMouseDown( event ) {

	event.preventDefault();
	if (_inHud) {
        _rotationMouseDown = true;
        _mouseX = event.clientX;
        _mouseY = event.clientY;
	} else {
		console.log("ray casting...");
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );

		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( ALL_OBJECTS );

		if ( intersects.length > 0 ) {
			var object = intersects[ 0 ].object.userData;
			_foreground_meshes = loadInspectionObject(object);
			showInspectionHud(object)
		}
	}
}

function rotateInspectionMeshes(dx, dy) {
	//console.log(dx,dy)

	
	for (index in _foreground_meshes) {
		//var pos = _foreground_meshes[index].position
		//var pos = new THREE.Vector3(pos.x, pos.y, pos.z);
		_foreground_meshes[index].rotation.y += dx / 100;
    		_foreground_meshes[index].rotation.x += dy / 100;
    		//_foreground_meshes[index].position = pos;
	}
}

function onDocumentMouseMove(event) {
	if (_inHud && _rotationMouseDown) {
		event.preventDefault();

        var deltaX = event.clientX - _mouseX;
        var deltaY = event.clientY - _mouseY;
        _mouseX = event.clientX;
        _mouseY = event.clientY;
        rotateInspectionMeshes(deltaX, deltaY);
	}
}

function onDocumentMouseUp(event) {
	if (_inHud) {
		event.preventDefault();
        _rotationMouseDown = false;
	}
}

var _wallMesh;

function showInspectionHud(object) {
	_inHud = true;
	var wallGeo = new THREE.PlaneGeometry(WORLD_RADIUS,WORLD_RADIUS,1,1);
	var wallMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.75, color : "black" } );
	_wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
	camera.add(_wallMesh);
	_wallMesh.position.z = -75;
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
	camera.remove(_wallMesh);
	_foreground_meshes = []
	_inHud = false;
}

function animateToDepartment(s) {
	var index = _departmentsToIndexes[s]
	animateToIndex(index);
}

function animateToIndex(index, callback) {
	CUR_INDEX = index;

	var stepBack = _intervalAngle/3
	var angle = -Math.PI/2-index*_intervalAngle + stepBack

	var start = { x : cylinderThing.rotation.x };
	var finish = { x : angle};

	var tween = new TWEEN.Tween(start).to(finish, 2000);
	tween.easing(TWEEN.Easing.Quartic.InOut)
	tween.onUpdate(function(){
	    cylinderThing.rotation.x = start.x
	});

	if(callback != null) {
		tween.onComplete(callback);
	}

	tween.start();	
}

function departmentClick(s) {
	if (_inHud) return;
	animateToDepartment(s);
}
