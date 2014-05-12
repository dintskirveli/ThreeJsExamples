var departmentsToShelfSpaceUsage = {};
var _numberOfDepartments = 0;
var extraShelves = 0;

var ALL_OBJECTS = []

function getShelfWidth() {
	return 12*2;
}

function getShelfHeight() {
	return 1;
}

function getShelfLength() {
	return 12*6;
}

//height between shelves
function getShelfDistance() {
	return 16;
}

function getPaddingBetweenObjects() {
	return 1;
}

//Shelves per single shelf tower
function getNumShelves() {
	return 4;
}

function getAisleWidth() {
	return 6*12;
}
/*
function getShelfWallHeight() {
	return (getNumShelves()-1)*(getShelfDistance()+getShelfHeight());
}*/

var _departmentsToIndexes = {}
var _intervalAngle;

function createShelves(scene, body, departmentList, config) {
	var geometries = new THREE.Geometry();
	var geometry = new THREE.CubeGeometry(
		getShelfWidth(), 
		getShelfHeight(), 
		getShelfLength());
	var shelvesMesh = new THREE.Mesh( geometry);

	var numObjects = departmentList.length;
	_numberOfDepartments = numObjects;
	var intervalAngle = Math.PI*2/numObjects;
	_intervalAngle = intervalAngle
	for (var i = 0; i<numObjects;i++) {
		var shelfGeometries = new THREE.Geometry();
		for (var j = 0; j<getNumShelves();j++) {
			shelvesMesh.position.set(
				0,
				getShelfDistance()*j, 
				0);
			THREE.GeometryUtils.merge( shelfGeometries, shelvesMesh );
		}
		

		var textMesh = createText(departmentList[i]);
		
		THREE.GeometryUtils.merge( shelfGeometries, textMesh );
		var finalMesh = new THREE.Mesh( shelfGeometries )

		var department = departmentList[i];
		console.log("department: "+department);
		var shelfUsage = new THREE.Vector3(0,0,0);
		for (var index in config.departments[department]) {
			var object = config.departments[department][index];
			shelfUsage = loadObject(object, body, i*intervalAngle, shelfUsage)
		}

		finalMesh.rotation.z = i*intervalAngle
		_departmentsToIndexes[departmentList[i]] = i;

		finalMesh.translateY(WORLD_RADIUS);

		THREE.GeometryUtils.merge( geometries, finalMesh );
	}

	var finalMesh = new THREE.Mesh( geometries, new THREE.MeshPhongMaterial())
	finalMesh.castShadow = true;
	finalMesh.rotation.x = Math.PI/2;

	body.add(finalMesh)
}



function loadObject(object, body, angle, used) {
	var pos, width, length, height;
	var dims = object.dimensions;
	height = dims.height;
	if (object.type == "cube") {
		width= dims.width;
		length = dims. length;
		pos = baseLoadObject(object.quantity, width, length, height, used);
		used = loadCube(object, body, angle, pos);
	} else if (object.type == "cylinder") {
		width = dims.radius*2;
		length = dims.radius*2;
		pos = baseLoadObject(object.quantity, width, length, height, used);
		used = loadCylinder(object, body, angle, pos);
	}
	return used;
}


function baseLoadObject(quantity, pwidth, plength, pheight, used) {

	var width = pwidth
	var depth = plength

	var usedVector = used;
 	var usedWidth = usedVector.z;

	var padding = getPaddingBetweenObjects();
	var widthItems = Math.floor((getShelfLength() - usedWidth)/(width + padding));
	var depthItems = Math.floor((getShelfWidth())/(depth + padding));

	var widthIndex = 0, depthIndex = 0;
	var heightIndex = usedVector.y;
	var pos = [];
	for (var i = 0; i < quantity; i++) {
		pos.push(new THREE.Vector3(
			(depth+padding)*depthIndex,
			heightIndex*getShelfDistance() + getShelfHeight()/2,
			usedWidth + (width+padding)*widthIndex));

		depthIndex++;
		if (depthIndex >= depthItems) {
			depthIndex = 0;
			widthIndex++;
			if (widthIndex >= widthItems) {
				heightIndex++;
				usedWidth = 0;
				widthItems = Math.floor((getShelfLength() - usedWidth)/(width + padding));
				widthIndex = 0;
				depthIndex = 0;
				if (heightIndex >= getNumShelves()) {
					alert("ran out of shelf space");
					break;
				}
			}
		}
	}
	return pos;
}

function loadTexture(filename) {
	return THREE.ImageUtils.loadTexture(filename, {});
}

function loadInspectionObject(object) {
	var inspectionZ = -30;
	if (object.type == 'cube') {
		var meshes = loadCube(object)
		for (index in meshes) {
			var mesh = meshes[index];
			//mesh.position.set(0,0,0)
			camera.add(mesh)
			mesh.position.z = inspectionZ;
			mesh.rotation.y = -Math.PI/2;
		}
		return meshes;
	} else if(object.type == 'cylinder') {
		var meshes = loadCylinder(object)
		for (index in meshes) {
			var mesh = meshes[index];
			camera.add(mesh)
			mesh.position.z = inspectionZ;
			mesh.rotation.y = -Math.PI/2;
		}
		return meshes;
	}
}

function loadCube(json, body, angle, pos) {
	console.log("loadCube..")

	var inspection = false
	if (body == null && angle == null && pos == null) {
		console.log("NOT IN KANSAS ANYMORE")
		inspection = true
	}

	var images = json.materials.faces;

	var materials = []
	for (var i = 0; i < images.length; i++) {

		var texture = THREE.ImageUtils.loadTexture(images[i], {});
		if (inspection) {
			texture.anisotropy = 16;
			materials.push(new THREE.MeshBasicMaterial( { map: texture } ));
		} else {
			materials.push(new THREE.MeshPhongMaterial( { map: texture } ));
		}

	}
	var quantity = json.quantity;
	var dims = json.dimensions;

	var cubes = new THREE.Geometry();
	var cube = new THREE.Mesh( new THREE.CubeGeometry(dims.width,dims.height,dims.length) );

	var end;
	if (inspection) {
		end = 1;
		pos = [new THREE.Vector3(0,0,0)];
	} else {
		end = Math.min(pos.length, quantity);
	}

	for (var i = 0; i < end; i++) {
		
		cube.position =  new THREE.Vector3(pos[i].x,pos[i].y,pos[i].z);

		cube.position.x = cube.position.x + dims.length/2 -getShelfWidth()/2;
		cube.position.y = cube.position.y + dims.height/2;
		cube.position.z = cube.position.z + dims.width/2-getShelfLength()/2;
		cube.rotation.set(0,Math.PI/2,0);
		if (inspection) {
			cube.position = pos[i];
		} 
		THREE.GeometryUtils.merge( cubes, cube );
	}

	var cubesMesh = new THREE.Mesh(cubes, new THREE.MeshFaceMaterial(materials));
	cubesMesh.castShadow = true;
	cubesMesh.receiveShadow = true;

	if (inspection) {
		return [cubesMesh];
	}

	cubesMesh.userData = json;

	cubesMesh.rotation.z = angle
	cubesMesh.rotation.x = Math.PI/2;
	cubesMesh.translateY(WORLD_RADIUS);
	body.add(cubesMesh)

	ALL_OBJECTS.push(cubesMesh);

	var usedVector = new THREE.Vector3(0,0,0);
	var lastPos = pos[pos.length-1];
	usedVector.z = lastPos.z + dims.width + getPaddingBetweenObjects();
	usedVector.y = Math.floor((lastPos.y-getShelfHeight())/getShelfDistance()) + 1;

	return usedVector;
}

function loadCylinder(json, world, angle, pos) {

	var inspection = false
	if (body == null && angle == null && pos == null) {
		console.log("NOT IN KANSAS ANYMORE")
		inspection = true
	}

	var radius = json.dimensions.radius;
	var height = json.dimensions.height;
	var width = radius*2;

	var sections = 60;

	var bodies = new THREE.Geometry();
	var lids = new THREE.Geometry();

	var lid = new THREE.Mesh(new THREE.CircleGeometry(radius,sections));
	var body = new THREE.Mesh( new THREE.CylinderGeometry( radius, radius, height, sections, 1, true ));
	var yRot = 0;

	var end; 
	if (inspection) {
		end = 1;
		pos = [new THREE.Vector3(0,0,0)];
	} else {
		end = Math.min(pos.length, json.quantity)
	}
	for (var i = 0; i < end; i++) {
		yRot = -Math.PI/2 + Math.random() * Math.PI/6 - Math.PI/12;
		
		var position = new THREE.Vector3(pos[i].x, pos[i].y, pos[i].z);
		position.x = position.x + radius - getShelfWidth()/2;
		position.z = position.z + radius - getShelfLength()/2;

		position.y = position.y + height/2;
		body.position = position;
		body.rotation.set(0, yRot, 0);
		if (inspection) {
			body.position = pos[i]
		}
		THREE.GeometryUtils.merge( bodies, body );

		
		position.y = position.y + height/2;
		lid.position = position;
		lid.rotation.set(3*Math.PI/2,0,yRot + Math.PI/2 * Math.random());
		
		if (inspection) {
			lid.position = pos[i]
			lid.position.y = lid.position.y + height/2
		}
		THREE.GeometryUtils.merge( lids, lid );

		if (inspection) {
			lid.position = pos[i]
			lid.position.y = lid.position.y - height
			lid.rotation.set(Math.PI/2,0,yRot);
			THREE.GeometryUtils.merge( lids, lid );
		}

	}
	var lidMesh;
	if (inspection) {
		lidMesh = new THREE.Mesh(lids, new THREE.MeshBasicMaterial( { map: loadTexture(json.materials.top) } ));
	} else {
		lidMesh = new THREE.Mesh(lids, new THREE.MeshPhongMaterial( { map: loadTexture(json.materials.top) } ));

	}
	lidMesh.castShadow = true;
	lidMesh.receiveShadow = true;
	var bodiesMesh;
	if (inspection) {
		bodiesMesh = new THREE.Mesh(bodies, new THREE.MeshBasicMaterial( { map: loadTexture(json.materials.label) } ));
	} else {
		bodiesMesh = new THREE.Mesh(bodies, new THREE.MeshPhongMaterial( { map: loadTexture(json.materials.label) } ));
	}
	
	bodiesMesh.castShadow = true;
	bodiesMesh.receiveShadow = true;
	bodiesMesh.userData = json;

	if (inspection) {
		return [lidMesh, bodiesMesh]
	}

	lidMesh.rotation.z = angle
	lidMesh.rotation.x = Math.PI/2;
	lidMesh.translateY(WORLD_RADIUS);

	world.add(lidMesh)
	
	bodiesMesh.rotation.z = angle
	bodiesMesh.rotation.x = Math.PI/2;
	bodiesMesh.translateY(WORLD_RADIUS);

	world.add(bodiesMesh)

	ALL_OBJECTS.push(bodiesMesh);

	var usedVector = new THREE.Vector3(0,0,0);
	var lastPos = pos[pos.length-1];
	usedVector.z = lastPos.z + width + getPaddingBetweenObjects();
	usedVector.y = Math.floor((lastPos.y-getShelfHeight())/getShelfDistance())+1;
	usedVector.x = lastPos.x + width + getPaddingBetweenObjects();
	return usedVector;
}

function createText(text) {
	var textGeo = new THREE.TextGeometry( text, {

		size: 20,
		height: 5,
		curveSegments: 4,

		//from 'helvetiker' js glyphs library
		font: "helvetiker",
		weight: "bold",
		style: "normal",

		bevelThickness: 1,
		bevelSize: 1,
		bevelEnabled: false,

		material: 0,
		extrudeMaterial: 0.1

	});
	textGeo.computeBoundingBox();
	var centerOffset = -( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x )/2;
	var textMesh = new THREE.Mesh(textGeo);

	textMesh.position.y = getShelfDistance()*getNumShelves();
	textMesh.rotation.y = Math.PI/2;
	textMesh.position.z = -centerOffset;
	return textMesh;
}
