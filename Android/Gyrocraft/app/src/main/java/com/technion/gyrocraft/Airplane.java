package com.technion.gyrocraft;

import java.io.Serializable;

/**
 * Created by galmalka on 4/9/16.
 */
public class Airplane implements Serializable {
    private String mName;
    private String mLargeImageName;
    private String mSmallImageName;
    private String mSpeedScalaImage;
    private String mSpeedBarImage;
    private String mAccelerationBarImage;



    public Airplane(String name, String speedBarImage, String accelerationBarImage, String largeImageId, String smallImageId, String scalaImageId) {
        mName = name;
        mLargeImageName = largeImageId;
        mSmallImageName = smallImageId;
        mSpeedScalaImage = scalaImageId;
        mSpeedBarImage = speedBarImage;
        mAccelerationBarImage = accelerationBarImage;

    }

    public String getName() {
        return mName;
    }

    public String getLargeImageName() {
        return mLargeImageName;
    }

    public String getSpeedBarImage() {
        return mSpeedBarImage;
    }

    public String getAccelerationBarImage() {
        return mAccelerationBarImage;
    }

    public String getSmallImageName() {
        return mSmallImageName;
    }

    public String getSpeedScalaImage(){return mSpeedScalaImage;}
}
