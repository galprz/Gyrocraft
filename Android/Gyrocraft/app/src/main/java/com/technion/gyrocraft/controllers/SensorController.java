package com.technion.gyrocraft.controllers;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

import com.technion.gyrocraft.SensorData;

public class SensorController implements SensorEventListener {
    //private fields
    private float[] mValuesMagnet= new float[3], mValuesAccel= new float[3];
    private boolean mIsListening =false;
    private Sensor mAccelSensor=null, mMagneticSensor=null;
    private SensorManager mSensorManager;
    private SensorData mLastCalibrate, mLastOrientationData,mOrientationData,mLastData;
    private float mSensitivity= (float) 0.01,mZ;

    public SensorController(Context context){
        mSensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        mAccelSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        mMagneticSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        mLastOrientationData =new SensorData(0,0);
        mLastCalibrate=new SensorData(0,0);
        mOrientationData=new SensorData(0,0);
        mLastData=new SensorData(0,0);
    }
    //methods
    public void startListen(){
        if (!mIsListening && mAccelSensor != null && mMagneticSensor != null) {
            mIsListening =true;
            mSensorManager.registerListener(this, mAccelSensor, SensorManager.SENSOR_DELAY_GAME);
            mSensorManager.registerListener(this, mMagneticSensor, SensorManager.SENSOR_DELAY_GAME);
        }
    }
    public void stopListen(){
        if(mIsListening) {
            mSensorManager.unregisterListener(this, mAccelSensor);
            mSensorManager.unregisterListener(this, mMagneticSensor);
            mIsListening =false;
        }
    }

    public void setSensitivity(float newSensitivity){
        mSensitivity=newSensitivity;
    }
    public void calibrate(){
        synchronized (mLastOrientationData) {
            mLastCalibrate.Pitch= mLastOrientationData.Pitch;
            mLastCalibrate.Roll= Math.abs(mLastOrientationData.Roll) > 0.1 ? Math.signum(mLastOrientationData.Roll) * 0.1 : mLastOrientationData.Roll;
        }
    }
    public SensorData g(){
        SensorData newData;
        synchronized (mOrientationData) {
            newData = mOrientationData;
        }

        synchronized (mLastOrientationData) {
            newData.filter(mLastOrientationData, mSensitivity);
            mLastOrientationData.Pitch= newData.Pitch;
            mLastOrientationData.Roll= newData.Roll;
            newData.minus(mLastCalibrate);
        }
            if (!((Math.abs(newData.Roll) > 0.8) ||(Math.abs(newData.Roll) > 0.6) && mZ < 0)){
                if(Math.abs(newData.Pitch)>0.8){
                    newData.Pitch=0.8*Math.signum(newData.Pitch);
                }
                newData.mul(1/0.8);
                double angleFix = 1 - Math.abs(newData.Roll);
                newData.Pitch = newData.Pitch * angleFix;

                mLastData.Pitch=newData.Pitch;
                mLastData.Roll=newData.Roll;
            }
            else{
                mLastData.Pitch=0;
                mLastData.Roll=1*Math.signum(newData.Roll);
            }

            return mLastData;
    }


    //listener Methods
    @Override
    public void onSensorChanged(SensorEvent event) {
            float temp[]=new float[3],RotationMatrix[]=new float[16];
            switch (event.sensor.getType()) {
                case Sensor.TYPE_ACCELEROMETER:
                    System.arraycopy(event.values, 0, mValuesAccel, 0, 3);
                    mZ=mValuesAccel[2];
                    break;
                case Sensor.TYPE_MAGNETIC_FIELD:
                    System.arraycopy(event.values, 0, mValuesMagnet, 0, 3);
                    SensorManager.getRotationMatrix(RotationMatrix, null, mValuesAccel, mValuesMagnet);
                    SensorManager.getOrientation(RotationMatrix, temp);
                    //if (temp[1] <= -Math.PI/2) { temp[1] += (-2*(Math.PI/2+temp[1])); } else if(temp[1] >= Math.PI/2){ temp[1] += (2*(Math.PI/2 - temp[1])); }

                    synchronized (mOrientationData) {
                        mOrientationData.Pitch=-temp[2];
                        mOrientationData.Roll=-temp[1];
                    }
                    break;
            }

    }
    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        //has to be here for implementing the sensorEventListener
    }

}
