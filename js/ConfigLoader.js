ConfigLoader.prototype = Object.create( JSONLoader.prototype );

function ConfigLoader(url, scene) {
	this.url = url;
	this.scene = scene;
};

ConfigLoader.prototype.processResult = function(config) {
	var departmentList = []
	var departments = config.departments;

	for (department in departments) {
		departmentList.push(department)
	}
	this.worlditizeMe(config,departmentList);
}

function addDepartmentsToHud(departmentList) {
	var list = $($(".list")[0])
	for (var index in departmentList) {
		var department = departmentList[index]
		list.append(
    		$('<li/>', {
		        'class': 'listItem',
		        html: department,
		        'onClick' : 'departmentClick(this.id)',
		        'id' : department
    		})
		);
	}
}

ConfigLoader.prototype.worlditizeMe = function(config, departmentList) {
	var radius = WORLD_RADIUS
	var width = 200
	var circ = 2*radius*Math.PI

	var textureSource = 'images/floor_ceramic.jpg';
	var texture = new THREE.ImageUtils.loadTexture(textureSource);
	var repeatNumCirc = 200;
	var repeatNumWidth = repeatNumCirc * (width / circ)
	texture.repeat.set( repeatNumCirc, repeatNumWidth);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.anisotropy = 4;

	var body = new THREE.Mesh( new THREE.CylinderGeometry( radius, radius, width, 500, 1, true ), new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide } ));
	body.rotation.z = Math.PI/2

	departmentList.sort();
	addDepartmentsToHud(departmentList);

	createShelves(this.scene, body, departmentList, config);

	body.receiveShadow=true;

	scene.add(body);
	_worldCylinder = body;

	animateToIndex(0);
}

ConfigLoader.prototype.config = function() {
	this.load(this.url);
}




