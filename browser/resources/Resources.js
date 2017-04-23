/* Load all resources object and setting of the game */
GYROCRAFT.ResourceLoader = function(){
	var mResourcesFile = "resources/resources.json?" + new Date().getTime();
	var deferred = $.Deferred();
	var R = {}; //resources
	var Rarray = [];
	var loaders = [];
	var overAllItems=0,loadedItems=0;

	function loadingProcess(){
		if(loadedItems==overAllItems) {
			//create R object
			for(var i = 0 ;i < Rarray.length;i++){
				addObjToResource(Rarray[i].id,Rarray[i].object)
			}
			deferred.notify(100);
			deferred.resolve(R);			
		}
		else
		{
			deferred.notify(Math.floor( loadedItems/overAllItems*100 ));
		}
	}


	function addObjToResource(id,obj){
		var current = R;
		path = id.split(".");
		for(var i=0; i < path.length-1 ; i++){
			if(!current[path[i]]){
				current[path[i]]={};
			}
			current = current[path[i]];
		}

		if(current[path[path.length - 1]]){
			throw "Error duplicate id when loading resource";
		}

		current[path[path.length - 1]] = obj;
	}

	function loadObjMtl(id,objSrc,mtlSrc){
		overAllItems++;
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setBaseUrl( '' );
		loaders.push({
			load : function(){
				mtlLoader.load( mtlSrc, function( materials ) {
					materials.preload();
					var objLoader = new  THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.load( 
						objSrc,
						//on complete
						function(object){
							Rarray.push({id : id , object : object});
							loadedItems++;
							loadingProcess();

						},
						//on sub progress
						undefined,
						//on error
						function( xhr ){

						}
					);
					loaders.push(objLoader);
				});
			}
		});
	}

	function loadObj(id,objSrc){
		overAllItems++;
		var objLoader = new  THREE.OBJLoader();
		loaders.push({
			load :	function(){
				objLoader.load( 
					objSrc,
					//on complete
					function(object){
						Rarray.push({id : id , object : object});
						loadedItems++;
						loadingProcess();

					},
					//on sub progress
					undefined,
					//on error
					function( xhr ){

					}
				);
			}
		});
	}

	function loadTexture(id,textureSrc){
		overAllItems++;
		var textureLoader = new THREE.TextureLoader();
		loaders.push( {
			load : function(){
				textureLoader.load(
					textureSrc,
						//on complete
					function(texture){
						Rarray.push({id : id , object : texture});
						loadedItems++;
						loadingProcess();

					},
					//on sub progress
					undefined,
					//on error
					function( xhr ){

					}
				);
			}
		});
	}
	//helper to loadImage
	function loadImageSource(source){
		return $.Deferred (function (task) {
				        var image = new Image();
				        image.onload = function () {
				        	task.resolve({width:image.width,height:image.height});
				        }
				        image.onerror = function () {task.reject();}
				        image.src=source;
				    }).promise();
	}

	function loadAudioSource(source) {
		return $.Deferred (function (task) {
				        var audio = new Audio();
				        $(audio).one('canplay',task.resolve);
				        audio.addEventListener('error', function () {
				        	task.reject();
				        }, false);
				        audio.src=source;
				    }).promise();
	}

	function loadImage(id,imageSrc){
		overAllItems++;
		loaders.push( {
			load : function(){
				$.when(loadImageSource(imageSrc)).done(function (size) {
						Rarray.push({id : id , 
							object :{
								src : imageSrc,
								width : size.width,
								height : size.height
							} 
						});
						loadedItems++;
						loadingProcess();
				});
			}
		});
	}

	function loadAudio(id,audioSrc){
		overAllItems++;
		loaders.push( {
			load : function(){
				$.when(loadAudioSource(audioSrc)).done(function () {
						Rarray.push({
							id : id, 
							object :{
								src: audioSrc
							}
						});
						loadedItems++;
						loadingProcess();
				});
			}
		});
	}

    $.getJSON(mResourcesFile, function(resources) {
	    for(var i=0 ; i<resources.length ; i++){
	    	if(resources[i].type == "OBJMTL"){
	    		loadObjMtl(resources[i].id,resources[i].object,resources[i].mtl);
	    	}else if(resources[i].type == "OBJ"){
	    		loadObj(resources[i].id,resources[i].object);
	    	}else if(resources[i].type == "TEXTURE"){
	    		loadTexture(resources[i].id,resources[i].src);
	    	}else if(resources[i].type == "IMAGE"){
	    		loadImage(resources[i].id,resources[i].src);
	    	}else if(resources[i].type == "AUDIO"){
	    		loadAudio(resources[i].id,resources[i].src);
	    	}
	    }
	    for(var i=0 ; i<loaders.length ; i++){
	    	loaders[i].load();
	    }
	});
	return deferred.promise();
}