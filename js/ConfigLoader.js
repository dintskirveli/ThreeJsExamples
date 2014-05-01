ConfigLoader.prototype = Object.create( JSONLoader.prototype );

function ConfigLoader(url, scene) {
	this.url = url;
	this.scene = scene;
};

ConfigLoader.prototype.processResult = function(config) {
	console.log("processing...");
	console.log(config);
	var itemIds = config.things;
	var pattern = config.pattern;
	var objectUrls = []
	

	for (var i = 0; i < itemIds.length; i++) {
		objectUrls.push(pattern.replace("%s",itemIds[i]));
	}

	var objectLoader = new ObjectJSONLoader(objectUrls, this.scene);
	objectLoader.config();
}

ConfigLoader.prototype.config = function() {
	this.load(this.url);
}




