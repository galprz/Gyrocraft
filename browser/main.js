(function main(){

    var mProgressBar = $('#progress_bar');
	var mProgressbarLabel = $('#progress_bar_label');
	var mSettingsFile = "setting/setting.json?" + new Date().getTime();
	var mSettings;
	var mResources;
	var mGame;
	var mSessionSettings;

	var getSettingsPromise = $.getJSON(mSettingsFile, function(settings) {
		mSettings = settings;
		GYROCRAFT.WebRtcConnection.init(mSettings.connection.web_rtc);
		GYROCRAFT.WebSocketConnection.init(mSettings.connection.web_socket);
		GYROCRAFT.FireBaseConnection.init(settings.connection.firebase);
		GYROCRAFT.setConnection(GYROCRAFT.ConnectionType.WebSocket);
		GlobalSetting  = mSettings;
	});

	function hideQrcode(){
		$('#qrcode').hide();
		$('#loader').show();
	}
	function showQrcode(){
		$('#loader').hide();
		$('#qrcode').show();
	}
	function createQrcode(){
		hideQrcode();
		$('#qrcode').qrcode({render : "canvas", text : GYROCRAFT.Connection.getRoom(),size : 256 });
		showQrcode();
	}
	var menu;
	function onEndGame(shouldDisconnect) {
		if (GYROCRAFT.Connection.getState() == GYROCRAFT.Connection.CONNECTED_TO_DEVICE && !shouldDisconnect) {
			menu = $('#mainConnected-box');
		}
		else {
			GYROCRAFT.Connection.disconnect();
			hideQrcode();
			$('#qrcode').html("");
			menu = $('#setup-box')
		}

		menu.show();

		$.when(
			createConnection()
			.progress(
				//on connection progress
				function(state){
					console.info(state);
				})
			.done(
				//when connection established
				function(sessionSettings){
					mSessionSettings = sessionSettings;
				})
			.fail(
				// If connection has failed
				function() {
					console.error("Connection to device has failed!");
					GYROCRAFT.Utils.showToast("Failed to connect to the device");
				})
			)
		.done(function() {
			menu.hide();
			if (mSessionSettings.isTutorial){
				mGame.startTutorial(mSessionSettings);
			}
			else {
				mGame.start(mSessionSettings);
			}
		})
	}

	function createConnection(){
		var deferred = $.Deferred();
		var listener = new IConnectionListener();

		listener.onSessionConnect = function(result) {
			if (result.success) {
				createQrcode();
				deferred.notify("Connected to server");
			}
			else {
				deferred.reject(result.reason);
			}
		}

		listener.onIncomingMessage = function(message) {
			if (!message) {
				console.error("Undefined message");
				return;
			}else if(message.type != "Game"){
				console.warn("Got message of type " + message.type + " instead of Game");
				return;
			}
			deferred.resolve(message.body);
		}

		listener.onPeerLeft = function() {
			GYROCRAFT.Utils.showToast("Lost connection with the device");
			$('#mainConnected-box').hide();
			$('#setup-box').show();
			menu=$('#setup-box');
		}

		listener.onSessionDisconnect = function() {
			GYROCRAFT.Utils.showToast("Lost connection with the device");
			$('#mainConnected-box').hide();
			$('#setup-box').show();
			menu=$('#setup-box');
			onEndGame(true);
		}

		GYROCRAFT.Connection.registerListener(listener);

		// Connect only if needed
		if (GYROCRAFT.Connection.getState() == GYROCRAFT.Connection.DISCONNECTED) {
			GYROCRAFT.FireBaseConnection.getConnectionType(function(connectionType) {
				GYROCRAFT.setConnection(connectionType);
				GYROCRAFT.Connection.registerListener(listener);
				if (connectionType == GYROCRAFT.ConnectionType.WebRtc){
					var UUID = "1" + (new Skylink).generateUUID();
					$('#websocket-message').hide();
				} 
				else {
					var UUID = "0" + (new Skylink).generateUUID();
					$('#websocket-message').show();
				}
				
				GYROCRAFT.Connection.connect(UUID);
			})
		}
		
		return deferred.promise();
	}

	$.when(getSettingsPromise).done(function() {
		$.when(
			GYROCRAFT.ResourceLoader()
			.progress(
				//on loading progress
				function(status){
					mProgressBar.width(status+"%");
					mProgressbarLabel.html(status+"% completed")
				})
			.done(
				// when game finishs loading
				function(resources){
					mResources = resources;
					mGame = new GYROCRAFT.Game(mSettings.game, mResources, onEndGame);
					mGame.initiate();
				}),
			createConnection()
			.progress(
				//on connection progress
				function(state){
					console.info(state);
				})
			.done(
				//when connection established
				function(sessionSettings){
					mSessionSettings = sessionSettings;
				})
			.fail(
				// If connection has failed
				function() {
					console.error("Connection failed!");
					GYROCRAFT.Utils.showToast("Failed to connect to the device");
				})
			)
		.done(function() {
			$('#setup-box').hide();
			if (mSessionSettings.isTutorial){
				mGame.startTutorial(mSessionSettings);
			}
			else {
				mGame.start(mSessionSettings);
			}
		})
	});

})();



