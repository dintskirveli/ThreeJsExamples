var departmentsToShelfSpaceUsage = {};
var numberOfDepartments = 0;
var extraShelves = 0;

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
function getShelfPosition() {
	return -8;
}*/

function getShelfWallHeight() {
	return (getNumShelves()-1)*(getShelfDistance()+getShelfHeight());
}

function shelves(scene, numAisles) {
	var geometries = new THREE.Geometry();
	var geometry = new THREE.CubeGeometry(
		getShelfWidth(), 
		getShelfHeight(), 
		getShelfLength());
	var mesh = new THREE.Mesh( geometry);

	var shelfWalls = new THREE.CubeGeometry(
		getShelfWidth(), 
		getShelfWallHeight(), 
		getShelfHeight());

	var shelfWallMesh = new THREE.Mesh(shelfWalls);

	for (var i = 0; i<numAisles;i++) {
		var pos = new THREE.Vector3(6*12*i,0,0);
		for (var j = 0; j<getNumShelves();j++) {
			mesh.position.set(
				pos.x + getShelfWidth()/2,
				pos.y + getShelfDistance()*j + getShelfHeight()/2, 
				pos.z + getShelfLength()/2);
			THREE.GeometryUtils.merge( geometries, mesh );
		}
		shelfWallMesh.position.set(
				pos.x + getShelfWidth()/2,
				pos.y + getShelfWallHeight()/2, 
				pos.z - getShelfHeight()/2
			);
		THREE.GeometryUtils.merge( geometries, shelfWallMesh );

		shelfWallMesh.position.set(
				pos.x + getShelfWidth()/2,
				pos.y + (getNumShelves()-1)*(getShelfDistance()+getShelfHeight())/2, 
				pos.z + getShelfLength() + getShelfHeight()/2
			);
		THREE.GeometryUtils.merge( geometries, shelfWallMesh );
		
	}

	var mesh = new THREE.Mesh( geometries, new THREE.MeshBasicMaterial());
	scene.add(mesh);
}