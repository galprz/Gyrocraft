package com.technion.gyrocraft;

/**
 * Created by galmalka on 3/19/16.
 */
public class SensorData {

    public double Pitch, Roll;
    public SensorData(double roll, double pitch) {
        Pitch = pitch;
        Roll = roll;
    }
    public void filter(SensorData newData, double filter){
            if (Math.abs(Pitch - newData.Pitch) < filter)
                Pitch = newData.Pitch;
            if (Math.abs(Roll - newData.Roll) < filter)
                Roll = newData.Roll;
    }

    public void minus(SensorData other){
        Roll-=other.Roll;
        Pitch-=other.Pitch;
    }
    public void mul(double m){
        Roll*=m;
        Pitch*=m;
    }
}
