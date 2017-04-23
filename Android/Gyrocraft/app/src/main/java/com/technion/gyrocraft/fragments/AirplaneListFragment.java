package com.technion.gyrocraft.fragments;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;

import com.technion.gyrocraft.adapters.AirplaneArrayAdapter;
import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.IAirplaneFragmentListener;
import com.technion.gyrocraft.R;

public class AirplaneListFragment extends Fragment {
    private IAirplaneFragmentListener mListener;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_airplane_list, container, false);
        ListView listView = (ListView) view.findViewById(R.id.airplane_listview);
        AirplaneArrayAdapter arrayAdapter = new AirplaneArrayAdapter(getContext(), AssetsCache.getAirplanes());
        listView.setAdapter(arrayAdapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                if (mListener != null) {
                    mListener.onListItemClick(position);
                }
            }
        });
        return view;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        mListener = (IAirplaneFragmentListener) context;
    }
}
