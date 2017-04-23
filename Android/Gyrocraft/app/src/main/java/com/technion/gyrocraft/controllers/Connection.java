package com.technion.gyrocraft.controllers;

import android.util.Log;

import com.technion.gyrocraft.App;
import com.technion.gyrocraft.IConnectionListener;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.LinkedList;
import java.util.Queue;

/**
 * Created by galmalka on 6/15/16.
 */
public abstract class Connection {
    public enum State {Disconnected, ConnectedToRoom, ConnectedToBrowser};

    protected State mState = State.Disconnected;
    protected IConnectionListener mListener;
    protected Queue<Runnable> mCallbackQueue;
    protected Object mLock;

    public Connection() {
        mLock = new Object();
        mCallbackQueue = new LinkedList<>();
    }

    public abstract void connect(String room);

    public abstract void disconnect();

    public State getState() {
        synchronized (mLock) {
            return mState;
        }
    }

    public <T> void send(T obj) {
        try {
            JSONObject jsonObject = new JSONObject()
                    .put("type", obj.getClass().getSimpleName())
                    .put("body", new JSONObject(App.getGson().toJson(obj)));
            _send(jsonObject);
        } catch (JSONException e) {
            Log.e(getTag(), e.getMessage());
            // TODO: Handle errors
        }
    }

    public void send(String str, String type) {
        sendPrimitive(str, type);
    }

    public void send(int x, String type) {
        sendPrimitive(x, type);
    }

    public void send(double x, String type) {
        sendPrimitive(x, type);
    }

    public void send(long x, String type) {
        sendPrimitive(x, type);
    }

    public void send(boolean b, String type) {
        sendPrimitive(b, type);
    }

    private void sendPrimitive(Object obj, String type) {
        try {
            JSONObject jsonObject = new JSONObject()
                    .put("type", type)
                    .put("body", obj);
            _send(jsonObject);
        } catch (JSONException e) {
            Log.e(getTag(), e.getMessage());
            // TODO: Handle errors
        }
    }

    protected abstract void _send(JSONObject jsonObject);

    protected abstract String getTag();

    public void registerListener(IConnectionListener listener) {
        synchronized (mLock) {
            if (mListener != null) {
                Log.w(getTag(), "Registering a new listener although there is one already!");
            }

            mListener = listener;
            // Handle all the callbacks we saved when there wasn't a listener
            while (!mCallbackQueue.isEmpty()) {
                mCallbackQueue.poll().run();
            }
        }
    }

    public void unregisterListener() {
        mListener = null;
    }

    protected void callListener(Runnable runnable) {
        synchronized (mLock) {
            if (mListener == null) {
                mCallbackQueue.add(runnable);
            } else {
                runnable.run();
            }
        }
    }

    protected void onMessage(final Object message) {
        callListener(new Runnable() {
            @Override
            public void run() {
                try {
                    mListener.onMessage(new JSONObject((String) message));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
