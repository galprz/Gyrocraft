package com.technion.gyrocraft.controllers;

import android.util.Log;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.technion.gyrocraft.App;
import com.technion.gyrocraft.App.ConnectionType;


/**
 * Created by Eliran_work on 16/6/2016.
 */
public class FireBaseManager {
    private static String sTag="FireBaseManager";
    public static class ServerData {

        public String ip;

        public ServerData() {
            // Default constructor required for calls to DataSnapshot.getValue(User.class)
        }

        public ServerData(String ip) {
            this.ip = ip;
        }

    }
    public static void setIp(String roomKey, String phoneIp, int port){
        DatabaseReference database = FirebaseDatabase.getInstance().getReference();
        ServerData sd= new ServerData(phoneIp + ":" + port);
        Log.i(sTag, "attempting add IP to database");

        database.child("roomList").child(roomKey).child("phone").
                setValue(sd);/*, new DatabaseReference.CompletionListener() {
            @Override
            public void onComplete(DatabaseError databaseError, DatabaseReference databaseReference) {
                // Transaction completed
                Log.w(sTag, "postTransaction:onComplete:" + databaseError);
                //do something on success (databaseError = null);
            }
        });*/
    };
}
