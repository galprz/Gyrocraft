package com.technion.gyrocraft;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.graphics.Typeface;
import android.media.MediaPlayer;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

/**
 * Created by galmalka on 4/8/16.
 */
public class AssetsCache {
    private static final String sTag = "AssetsCache";
    private static final String sHighScoresTag = "HighScores";
    private static final String sSharedPreferencesTag = "GyroPref";
    private static final String sDeviceVolumeTag = "DeviceVolume";
    private static final String sVibrateTag = "Vibrate";
    private static final String sBrowserVolumeTag = "BrowserVolume";
    private static final int MAX_SCORES = 10;

    private static HashMap<String, Typeface> sFontCache = new HashMap<>();
    private static List<Airplane> sAirplanes = new ArrayList<>();
    private static List<Score> sScores = new ArrayList<>();
    private static HashMap<Integer, MediaPlayer> sAudioCache = new HashMap<>();
    private static float sDeviceVolume = -1;
    private static int sBrowserVolume = -1;
    private static Boolean sVibrate = null;

    public static Typeface getTypeface(String fontName) {
        Typeface typeface = sFontCache.get(fontName);

        if (typeface == null) {
            try {
                typeface = Typeface.createFromAsset(App.getContext().getAssets(), fontName);
            } catch (Exception e) {
                return null;
            }

            sFontCache.put(fontName, typeface);
        }

        return typeface;
    }

    public static MediaPlayer getAudio(int id) {
        MediaPlayer mediaPlayer = sAudioCache.get(id);
        if (mediaPlayer == null) {
            try {
                mediaPlayer = MediaPlayer.create(App.getContext(), id);
            } catch (Exception e) {
                Log.e(sTag, "Couldn't find raw audio with id: " + id);
                return null;
            }

            sAudioCache.put(id, mediaPlayer);
        }

        mediaPlayer.setVolume(getDeviceVolume(), getDeviceVolume());
        return mediaPlayer;
    }

    public static List<Airplane> getAirplanes() {
        if (sAirplanes.size() == 0) {
            try {
                JSONArray airplanesArray = new JSONArray(loadJsonFromAssets("airplanes.json"));
                for (int i=0; i < airplanesArray.length(); i++) {
                    Airplane airplane = App.getGson().fromJson(airplanesArray.get(i).toString(), Airplane.class);
                    sAirplanes.add(airplane);
                }
            } catch (JSONException ex) {
                Log.e(sTag, ex.getMessage());
            }
        }

        return sAirplanes;
    }

    public static List<Score> getScores() {
        if (sScores.size() == 0) {
            try {
                SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
                String scores = sharedpreferences.getString(sHighScoresTag, "[]");
                JSONArray scoreArray = new JSONArray(scores);
                for (int i=0; i < scoreArray.length(); i++) {
                    Score score = App.getGson().fromJson(scoreArray.get(i).toString(), Score.class);
                    sScores.add(score);
                }
            } catch (JSONException ex) {
                Log.e(sTag, ex.getMessage());
            }
        }

        return sScores;
    }

    public static void addScore(Score newScore) {
        if (sScores.size() < MAX_SCORES) {
            sScores.add(newScore);
        }
        else {
            sScores.remove(MAX_SCORES - 1);
            sScores.add(newScore);
        }
        Collections.sort(sScores, new Comparator<Score>() {
            @Override
            public int compare(Score lhs, Score rhs) {
                return rhs.Score - lhs.Score;
            }
        });

        SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
        Editor editor = sharedpreferences.edit();
        editor.putString(sHighScoresTag, App.getGson().toJson(sScores));
        editor.commit();
    }

    public static boolean isNewScore(int score) {
        List<Score> scores = getScores();
        return (scores.size() < MAX_SCORES || scores.get(MAX_SCORES - 1).Score < score) && score > 0;
    }

    public static boolean isHighScore(int score) {
        List<Score> scores = getScores();
        return (scores.size() > 0 ? score > scores.get(0).Score : true);
    }

    public static int getHighScore() {
        List<Score> scores = getScores();
        return scores.size() == 0 ? 0 : scores.get(0).Score;
    }

    public static float getDeviceVolume() {
        if (sDeviceVolume == -1) {
            SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
            sDeviceVolume = sharedpreferences.getFloat(sDeviceVolumeTag, 1);
        }
        return sDeviceVolume;
    }

    public static void setDeviceVolume(int volume) {
        sDeviceVolume = (float)volume / 100;
        SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
        Editor editor = sharedpreferences.edit();
        editor.putFloat(sDeviceVolumeTag, sDeviceVolume);
        editor.commit();
    }

    public static int getBrowserVolume() {
        if (sBrowserVolume == -1) {
            SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
            sBrowserVolume = sharedpreferences.getInt(sBrowserVolumeTag, 100);
        }
        return sBrowserVolume;
    }

    public static void setBrowserVolume(int volume) {
        sBrowserVolume = volume;
        SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedpreferences.edit();
        editor.putInt(sBrowserVolumeTag, sBrowserVolume);
        editor.commit();
    }

    public static boolean isVibrate() {
        if (sVibrate == null) {
            SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
            sVibrate = sharedpreferences.getBoolean(sVibrateTag, true);
        }
        return sVibrate.booleanValue();
    }

    public static void setVibrate(boolean vibrate) {
        sVibrate = vibrate;
        SharedPreferences sharedpreferences = App.getContext().getSharedPreferences(sSharedPreferencesTag, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedpreferences.edit();
        editor.putBoolean(sVibrateTag, sVibrate);
        editor.commit();
    }

    private static String loadJsonFromAssets(String fileName) {
        String json = null;
        try {
            InputStream is = App.getContext().getAssets().open(fileName);
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            json = new String(buffer, "UTF-8");
        } catch (IOException ex) {
            Log.e(sTag, ex.getMessage());
        }
        return json;
    }

    public static class Score {
        public String Name;
        public int Score;

        public Score(String name, int score) {
            Name = name;
            Score = score;
        }
    }
}