var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Cloud = function(scene,Setting,R,position){
//Private:
	var base = position || new THREE.Vector3( 0 , 0 , 0 );
    var NUMBER_OF_CENTERS = 10;
    function particleStayProbability (rand){
        return (Math.random() > Math.abs(rand.x / 0.5) &&
                Math.random() > Math.abs(rand.y / 0.5) && 
                Math.random() > Math.abs(rand.z / 0.5))
    }
    var randomDirectionVector = GYROCRAFT.Utils.randomDirectionVector;
    var rangeRandom = GYROCRAFT.Utils.rangeRandom;
    
    //Choose random size
    var x = rangeRandom(Setting.size.min,Setting.size.max);
    var y = rangeRandom(x / 4 , x /2 ) ;
    var z = rangeRandom(x / 2 , x * 2);
    var spread = new THREE.Vector3( x , y , z );
    var numberOfParticles = rangeRandom( x / 10 , x / 6 );
    //Choose random opacity 
    var opacity = rangeRandom(Setting.opacity.min,Setting.opacity.max);

	var cloudGeo = new THREE.BufferGeometry();
    var cloudMat = new THREE.PointsMaterial({
                size: rangeRandom(numberOfParticles,numberOfParticles*1.5) , //particle size
                transparent: true,
                opacity: opacity,
                map: R.cloud1,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                fog: true,
                vertexColors:THREE.NoColors
            });
    //Define spread centers;
    var centers = [];
    centers.push(base);
    for(var i = 0; i<NUMBER_OF_CENTERS;i++){
        var randDirection = randomDirectionVector();
        centers.push(new THREE.Vector3().addVectors( base, new THREE.Vector3().multiplyVectors( spread, randDirection )));
    }

    var particles = [];
 	for (var i = 0; i < numberOfParticles ; i++) {
        var rand3 = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
 		if(particleStayProbability(rand3)){
 		  var particle = new THREE.Vector3().addVectors( centers[ i % centers.length ], new THREE.Vector3().multiplyVectors( spread, rand3 ) );
      	  particles.push(particle);
 		}
    }

    var positions = new Float32Array( particles.length * 3 );
    for ( var i = 0,j=0; i < positions.length; i += 3,j++ ) {
    		positions[ i ]     = particles[j].x;
			positions[ i + 1 ] = particles[j].y;
			positions[ i + 2 ] = particles[j].z;
	}

 	cloudGeo.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
 	cloudGeo.computeBoundingSphere();
    
    var cloud = new THREE.Points(cloudGeo, cloudMat);
    scene.add(cloud);

//Public:
    this.position = base ;
    this.destroy = function(){
		scene.remove(cloud);
	}  
}