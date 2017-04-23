package com.technion.gyrocraft.fragments;

import android.content.Context;
import android.os.Bundle;
import android.os.Vibrator;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CompoundButton;
import android.widget.SeekBar;
import android.widget.SeekBar.OnSeekBarChangeListener;
import android.widget.Switch;

import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.R;

public class OptionsFragment extends Fragment {
    private static final String KEY = "FromPause";

    public static OptionsFragment newInstance(boolean fromPause) {
        OptionsFragment optionsFragment = new OptionsFragment();
        Bundle args = new Bundle();
        args.putSerializable(KEY, fromPause);
        optionsFragment.setArguments(args);
        return optionsFragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view;
        if (getArguments().getBoolean(KEY)) {
            view = inflater.inflate(R.layout.fragment_options_pause, container, false);
        }
        else {
            view = inflater.inflate(R.layout.fragment_options, container, false);
        }

        Switch vibrateSwitch = (Switch) view.findViewById(R.id.vibrate_switch);
        vibrateSwitch.setChecked(AssetsCache.isVibrate());
        vibrateSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                AssetsCache.setVibrate(isChecked);
            }
        });

        if (!((Vibrator)getActivity().getSystemService(Context.VIBRATOR_SERVICE)).hasVibrator()) {
            vibrateSwitch.setVisibility(View.GONE);
            view.findViewById(R.id.vibrate_not_available).setVisibility(View.VISIBLE);
        }
        else {
            vibrateSwitch.setVisibility(View.VISIBLE);
            view.findViewById(R.id.vibrate_not_available).setVisibility(View.GONE);
        }

        SeekBar deviceVolumeSeekBar = (SeekBar) view.findViewById(R.id.device_volume_seekbar);
        deviceVolumeSeekBar.setProgress((int) (AssetsCache.getDeviceVolume()*100));
        deviceVolumeSeekBar.setOnSeekBarChangeListener(new OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                AssetsCache.setDeviceVolume(progress);
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });

        SeekBar browserVolumeSeekBar = (SeekBar) view.findViewById(R.id.browser_volume_seekbar);
        browserVolumeSeekBar.setProgress(AssetsCache.getBrowserVolume());
        browserVolumeSeekBar.setOnSeekBarChangeListener(new OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                AssetsCache.setBrowserVolume(progress);
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });

        return view;
    }
}
