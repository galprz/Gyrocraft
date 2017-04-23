package com.technion.gyrocraft.controllers;

import android.content.Context;
import android.content.res.Resources;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Looper;
import android.util.Log;

import com.google.gson.Gson;
import com.technion.gyrocraft.App;
import com.technion.gyrocraft.IConnectionListener;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by galmalka on 4/26/16.
 */
public class WebSocketConnection extends Connection {
    private static final String sTag = "WebSocketConnection";

    // region Singelton implementation
    private static WebSocketConnection _instance = null;

    public static void init() {
        if (_instance != null) {
            Log.i(sTag, "Already initialized!");
            return;
        }

        _instance = new WebSocketConnection();
    }

    public static WebSocketConnection getInstance() {
        return _instance;
    }
    //endregion

    // region Class implementation
    private static final int sPort = 9999;

    private WebSocket mCurrentConnection;
    private Server mServer;

    private WebSocketConnection() {
    }

    public static String getIp(Context context) throws UnknownHostException {
        WifiManager wm = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        ByteBuffer byteBuffer = ByteBuffer.allocate(4);
        WifiInfo wifiInfo = wm.getConnectionInfo();
        byteBuffer.order(ByteOrder.LITTLE_ENDIAN);
        byteBuffer.putInt(wifiInfo.getIpAddress());
        InetAddress inetAddress = InetAddress.getByAddress(null, byteBuffer.array());
        return inetAddress.toString().substring(1);
    }

    @Override
    public void connect(String room) {
        synchronized (mLock) {
            if (mState == State.ConnectedToBrowser) {
                Log.d(sTag, "Trying to connect, but already connected");
                return;
            }
        }

        try {
            String ip = getIp(App.getContext());
            mServer = new Server(ip);
            mServer.start();
            FireBaseManager.setIp(room, ip, sPort);
        } catch (UnknownHostException e) {
            Log.e(getTag(), "Failed to open server: " + e.getMessage());
        }
    }

    @Override
    public void disconnect() {
        synchronized (mLock) {
            if (mState == State.Disconnected) {
                Log.d(sTag, "Trying to disconnect, but already disconnected");
                return;
            }
        }

        try {
            mServer.stop();
            mCurrentConnection = null;
        } catch (Exception e) {
            Log.e(getTag(), "Error while trying to stop server: " + e.getMessage());
        }
    }

    // region Privates
    @Override
    protected void _send(JSONObject jsonObject) {
        synchronized (mLock) {
            if (mState != State.ConnectedToBrowser || mCurrentConnection == null) {
                Log.w(getTag(), "Not connected to browser. Will not send the message");
                return;
            }

            try {
                mCurrentConnection.send(jsonObject.toString());
            }
            catch (Exception e) {
            }
        }
    }

    @Override
    protected String getTag() {
        return sTag;
    }

    private class Server extends WebSocketServer {
        private boolean mIsStarted;

        public Server(String address) throws UnknownHostException {
            super(new InetSocketAddress(address, sPort));
        }

        @Override
        public void onOpen(WebSocket conn, ClientHandshake handshake) {
            synchronized (mLock) {
                if (mState == State.ConnectedToBrowser) {
                    Log.w(getTag(), "Someone is trying to connect although already connected");
                    conn.close();
                    return;
                }

                Log.i(getTag(), String.format("Connected to %s", conn));
                mCurrentConnection = conn;
                mState = State.ConnectedToBrowser;
                callListener(new Runnable() {
                    @Override
                    public void run() {
                        mListener.onConnectToBrowser();
                    }
                });
            }
        }

        @Override
        public void onClose(WebSocket conn, int code, String reason, boolean remote) {
            synchronized (mLock) {
                if (conn != mCurrentConnection) {
                    Log.w(getTag(), "Connection closed by unknown client");
                    return;
                }

                Log.i(getTag(), "Connection was closed with reason: " + reason);
                try {
                    Looper.prepare();
                    stop();
                    mCurrentConnection = null;
                    mState = State.Disconnected;
                    callListener(new Runnable() {
                        @Override
                        public void run() {
                            mListener.onDisconnect();
                        }
                    });
                } catch (Exception e) {
                    Log.e(getTag(), "Error while trying to stop server: " + e.getMessage());
                }
            }
        }

        @Override
        public void onMessage(WebSocket conn, String message) {
            WebSocketConnection.this.onMessage(message);
        }

        @Override
        public void onError(WebSocket conn, Exception ex) {
            Log.e(getTag(), ex.getMessage());
            // TODO: Handle errors
        }

        @Override
        public void start() {
            if (!mIsStarted) {
                super.start();
                mIsStarted = true;
            }
        }

        @Override
        public void stop() throws IOException, InterruptedException {
            if (mIsStarted) {
                super.stop();
                mIsStarted = false;
            }
        }
    }
    //endregion
    //endregion
}
