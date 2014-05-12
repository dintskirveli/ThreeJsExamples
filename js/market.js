var camera, scene, renderer, container, projector, keyboard;
var _worldCylinder;
var _wallMesh;
var _foreground_meshes = [];
var _inHud = false;
var _rotationMouseDown = false;
var _mouseX = 0
var _mouseY = 0;
var _currentObject;
var CUR_INDEX = 0;
var TWEENING = false

var WORLD_RADIUS = 1000;

init();
animate();

function init() {
	container = document.getElementById( 'container' );
	scene = new THREE.Scene();
	projector = new THREE.Projector();
	keyboard = new THREEx.KeyboardState();

	rendererSetup();
	cameraSetup();
	inspectionWallSetup();

	new ConfigLoader("config.json", scene).config();

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

function tweenCallback() {
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

function rendererSetup() {
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.setSize(window.innerWidth, window.innerHeight);
  	renderer.shadowMapEnabled = true;
	renderer.setClearColor( "black", 1 );
	container.appendChild(renderer.domElement);
}

function animate() {
	requestAnimationFrame( animate );
	update();
	render();
}

function cameraSetup() {
	var camHeight = 25;
	camera = new THREE.PerspectiveCamera(30, getAspect(), 1, 10000);
	var y =  WORLD_RADIUS + camHeight;
	camera.position.set(0, y, 0)

	var lightOffset = 200;
	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 0, WORLD_RADIUS+lightOffset, -lightOffset );
	spotLight.target.position.set( 0, WORLD_RADIUS, 0 );

	spotLight.castShadow = true;
	spotLight.intensity = 2;
	scene.add(spotLight)

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

function onDocumentMouseDown( event ) {

	event.preventDefault();
	if (_inHud) {
        _rotationMouseDown = true;
        _mouseX = event.clientX;
        _mouseY = event.clientY;
	} else {
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );

		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( ALL_OBJECTS );

		if ( intersects.length > 0 ) {
			_currentObject = intersects[ 0 ].object.userData;
			_foreground_meshes = loadInspectionObject(_currentObject);
			showInspectionHud(_currentObject)
		}
	}
}

function rotateInspectionMeshes(dx, dy) {
	for (index in _foreground_meshes) {
	    _foreground_meshes[index].rotation.y += dx / 100;
    	_foreground_meshes[index].rotation.x += dy / 100;
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

function tweenBlackWall(toOpaque) {

	var dark = 0.85;
	var start = { opacity : 0 };
	var finish = { opacity : dark }

	if (!toOpaque) {
		start.opacity = dark;
		finish.opacity = 0;
	} 
	var tween = new TWEEN.Tween(start).to(finish, 1500);
	tween.easing(TWEEN.Easing.Exponential.Out)
	tween.onUpdate(function(){
	    _wallMesh.material.opacity = start.opacity
	});
	if (toOpaque) {
		camera.add(_wallMesh);
	} else {
		tween.onComplete(function() { camera.remove(_wallMesh)});
	}
	tween.start();
}

function showInspectionHud(object) {
	_inHud = true;
	tweenBlackWall(true);
	_wallMesh.position.z = -75;
	var hud = $('.inspectionHud')
	hud.find('#itemName').text(object.name)
	var price = "$"+parseFloat(object.price).toFixed(2);
	hud.find('#itemPrice').text(price)
	hud.show();
}

function inspectionWallSetup() {
	var wallGeo = new THREE.PlaneGeometry(WORLD_RADIUS,WORLD_RADIUS,1,1);
	var wallMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.75, color : "black" } );
	_wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
}

function hideInspectionHud() {
	$('.inspectionHud').hide()
	for (index in _foreground_meshes) {
		camera.remove(_foreground_meshes[index]);
	}
	tweenBlackWall(false);
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

	var start = { x : _worldCylinder.rotation.x };

	var tween = new TWEEN.Tween(start).to({x:angle}, 2000);
	tween.easing(TWEEN.Easing.Quartic.InOut)
	tween.onUpdate(function(){
	    _worldCylinder.rotation.x = start.x
	});

	if(callback != null) {
		tween.onComplete(callback);
	}

	tween.start();	
}

function addToCart() {
	var total = parseFloat($('#cartTotal').html())

	var list = $($(".cartList")[0])

	list.prepend(
    		$('<li/>', {
		        'class': 'cartListItem',
		        html: _currentObject.name,
		        'onClick' : 'departmentClick(this.id)'
    		})
		);
	total+=parseFloat(_currentObject.price);
	$('#cartTotal').html(total.toFixed(2))

}

function departmentClick(s) {
	if (!_inHud) {
		animateToDepartment(s);
	}
}