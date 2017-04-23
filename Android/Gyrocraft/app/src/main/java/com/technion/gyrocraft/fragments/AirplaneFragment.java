package com.technion.gyrocraft.fragments;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.technion.gyrocraft.Airplane;
import com.technion.gyrocraft.R;

public class AirplaneFragment extends Fragment {
    private static final String KEY = "Airplane";
    private View mView;

    public static AirplaneFragment newInstance(Airplane airplane) {
        AirplaneFragment airplaneFragment = new AirplaneFragment();
        Bundle args = new Bundle();
        args.putSerializable(KEY, airplane);
        airplaneFragment.setArguments(args);
        return airplaneFragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        mView = inflater.inflate(R.layout.fragment_airplane, container, false);
        Airplane airplane = (Airplane) getArguments().getSerializable(KEY);
        setView(airplane);
        return mView;
    }

    public void setView(Airplane airplane) {
        if (mView == null) {
            return;
        }

        TextView name = (TextView) mView.findViewById(R.id.airplane_name);
        ImageView image = (ImageView) mView.findViewById(R.id.airplane_image);
        ImageView speedBarImage = (ImageView) mView.findViewById(R.id.top_speed_bar);
        ImageView accelerationBarImage = (ImageView) mView.findViewById(R.id.acceleration_bar);

        name.setText(airplane.getName());
        int speedBarImageId = getContext().getResources().getIdentifier(airplane.getSpeedBarImage(), "drawable", getContext().getPackageName());
        speedBarImage.setImageResource(speedBarImageId);
        int accelerationBarImageId = getContext().getResources().getIdentifier(airplane.getAccelerationBarImage(), "drawable", getContext().getPackageName());
        accelerationBarImage.setImageResource(accelerationBarImageId);
        int largeImageId = getContext().getResources().getIdentifier(airplane.getLargeImageName(), "drawable", getContext().getPackageName());
        image.setImageResource(largeImageId);
    }
}
