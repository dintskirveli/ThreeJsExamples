ConfigLoader.prototype = Object.create( JSONLoader.prototype );

function ConfigLoader(url, scene) {
	this.url = url;
	this.scene = scene;
};

ConfigLoader.prototype.processResult = function(config) {
	console.log("processing...");
	/*var itemIds = config.things;
	var pattern = config.pattern;
	var objectUrls = []
	

	for (var i = 0; i < itemIds.length; i++) {
		objectUrls.push(pattern.replace("%s",itemIds[i]));
	}

	var objectLoader = new ObjectJSONLoader(objectUrls, this.scene);
	objectLoader.config();*/
	//console.log(config);
	var departmentList = []
	var departments = config.departments;

	for (department in departments) {
		//console.log(department);
		var objects = departments[department];
		//console.log(objects);
		departmentList.push(department)
	}

	//console.log(this.scene)
	this.worlditizeMe(config,departmentList);
	
}

function addDepartmentsToHud(departmentList) {
	var list = $($(".list")[0])
	//.append("<li class='listItem' onclick='departmentClick(this.id)' id = 'Soup'>Soup</li> ")
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
	console.log(departmentList.length)
}

ConfigLoader.prototype.worlditizeMe = function(config, departmentList) {

	var radius = WORLD_RADIUS
	var width = 200
	var circ = 2*radius*Math.PI

	var textureSource = 'images/floor_ceramic.jpg';
	var texture = new THREE.ImageUtils.loadTexture(textureSource);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.anisotropy = 4;
	//texture.minFilter = THREE.LinearFilter;
	//texture.magFilter = THREE.LinearMipMapNearestFilter;
	//console.log(texture)
	repeatNumCirc = 200;
	repeatNumWidth = repeatNumCirc * (width / circ)
	texture.repeat.set( repeatNumCirc, repeatNumWidth);
	var body = new THREE.Mesh( new THREE.CylinderGeometry( radius, radius, width, 500, 1, true ), new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide } ));
	//console.log(body);
	body.rotation.z = Math.PI/2
	var circ = 2*radius*Math.PI
	body.rotation.x = -Math.PI/2;

	var numObjects = departmentList.length;
	var intervalAngle = Math.PI*2/numObjects;

	//for (var i = 0; i < numObjects; i++) {
		/*var cube = new THREE.Mesh( new THREE.CubeGeometry(100,100,100), new THREE.MeshBasicMaterial("red") );
		cube.rotation.y = i*intervalAngle
		console.log();
		//cube.rotation.z = Math.PI/2
		cube.updateMatrix();
		cube.translateZ(radius + 50);
		console.log(cube.position);
		body.add(cube);*/

	//}
	departmentList.sort();
	addDepartmentsToHud(departmentList);
	createShelves(this.scene, body, departmentList, config);
	body.castShadow=true;
	body.receiveShadow=true;

	scene.add(body);
	cylinderThing = body;

	animateToIndex(0);
}

ConfigLoader.prototype.config = function() {
	this.load(this.url);
}




