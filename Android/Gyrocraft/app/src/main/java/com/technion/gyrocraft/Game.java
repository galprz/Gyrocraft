package com.technion.gyrocraft;

import java.io.Serializable;

/**
 * Created by galmalka on 5/7/16.
 */
public class Game implements Serializable {
    public String airplane;
    public int volume;
    public int highScore;
    public boolean tutorialMode = false;

    public Game(String airplane, int volume, int highScore,boolean tutorialMode) {
        this.airplane = airplane;
        this.volume = volume;
        this.highScore = highScore;
        this.tutorialMode = tutorialMode;
    }
}
