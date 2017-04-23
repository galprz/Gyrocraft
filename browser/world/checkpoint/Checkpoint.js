var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Checkpoint = function(position, collisionCallback, scene, settings){
	var Z_RANGE = 1000;

	var mCheckpoint = new THREE.Object3D();
	var geometry = new THREE.TorusGeometry(settings.radius,
										   settings.tube,
										   settings.radialSegments, 
										   settings.tubularSegments);
	var material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
	var torus = new THREE.Mesh(geometry, material);
	mCheckpoint.add(torus);
	mCheckpoint.position.set(position.x, position.y, position.z);

	var mActive = true;

// public:
	this.update = function(airplanePosition) {
		if (!mActive) {
			return;
		}

		if (Math.pow(airplanePosition.x - position.x, 2)
		    + Math.pow(airplanePosition.y - position.y, 2)
		    + Math.pow(airplanePosition.z - position.z, 2) 
		    <= Math.pow(settings.radius + 100, 2)) {
			collisionCallback();
		}
	}

	this.addToScene = function() {
		scene.add(mCheckpoint);
	}

	this.destroy = function() {
		scene.remove(mCheckpoint);
		mActive = false;
	}

	this.getPosition = function() {
		return position;
	}
}