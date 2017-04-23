package com.technion.gyrocraft.fragments;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v4.app.ListFragment;
import android.util.Pair;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.google.gson.internal.LinkedTreeMap;
import com.technion.gyrocraft.App;
import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.R;
import com.technion.gyrocraft.adapters.LeaderboardArrayAdapter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LeaderBoardFragment extends ListFragment {
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_leaderboard, container, false);
        LeaderboardArrayAdapter adapter = new LeaderboardArrayAdapter(getActivity(), AssetsCache.getScores());
        setListAdapter(adapter);
        return view;
    }

}
