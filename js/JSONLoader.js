function JSONLoader() {};

JSONLoader.prototype = {
	load : function(url) {
		var xhr = new XMLHttpRequest();
		var length = 0;
		var loader = this;
		xhr.onreadystatechange = function() {
			if ( xhr.readyState == 4 ) {
				if ( xhr.status == 200 || xhr.status == 0 ) {
					try {
						loader.processResult(JSON.parse( xhr.responseText ));
					} catch ( error ) {
						console.error( error );
					}
				} else {
					console.error( "Couldn't load [" + url + "] [" + xhr.status + "]" );
				}
			} else if ( xhr.readyState == 2 ) {
				length = xhr.getResponseHeader( "Content-Length" );
			}
		};
		xhr.open( "GET", url, true );
		xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		xhr.setRequestHeader( "Content-Type", "text/plain" );
		xhr.send( null );
	},
	processResult : function(json) {
		console.log("Do not directly create a JSONLoader");
	}
}