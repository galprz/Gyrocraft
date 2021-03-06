<p align="center">
  <img src="images/gyrocraft.png" width="600"/>
</p>
<p align="center">
  <img src="images/logos.png" width="200"/>
</p>
<p align="center">
<a href="http://gyrocraft.co.nf">http://gyrocraft.co.nf</a>
<a href="https://github.com/galprz/Gyrocraft/blob/master/final-submit/app-debug.apk?raw=true">Download ths android application</a>
</p>

## What it is
Gyrocraft is an arcade-style game created to provide an immersive gameplay experience.<br>
By utilizing both your computer screen and handheld device, it brings you the ultimate gaming experience.<br>

Moving your device and looking at it simultaneously can be pretty hard we created Gyrocraft as a project in the Technion to solve that problem

## Technology
* WebGL + ThreeJS - we created a 3D game in the browser by using ThreeJS framework that use WebGL.
* Android - we developed an android app to control the game
* WebRTC + WebSocket - the android app connects to the browser with WebRTC or use WebSocket connection as a fallback

## How to play

* Go to http://gyrocraft.co.nf
* [Download the apk](https://github.com/galprz/Gyrocraft/blob/master/final-submit/app-debug.apk?raw=true) to your Android device and install it
* In the app press play , pick a plane and scan the code that you see in the browser

## Connection
We used [Skylink](https://skylink.io/) service to create a P2P connection between the browser and the android device . <br>
Skylink provides a simple javascript and android sdk to create fast and reliable P2P connection with WebRTC.<br> go to skylink website to learn more.

As a fallback we created a simple WebSocket connection.<br>
The android app creates Websocket server and the browser connect to it as a client.<br>
In order to connect via WebSocket the browser and the android device need to be connected to the same wifi

## Useful links

* [ThreeJS](https://threejs.org/)
* [WebRTC](https://webrtc.org/)
* [Skylink](https://skylink.io/)
