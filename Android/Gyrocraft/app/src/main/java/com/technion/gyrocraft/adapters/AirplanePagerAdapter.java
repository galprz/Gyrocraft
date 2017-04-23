package com.technion.gyrocraft.adapters;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;

import com.technion.gyrocraft.Airplane;
import com.technion.gyrocraft.fragments.AirplaneFragment;

import java.util.List;

/**
 * Created by galmalka on 4/9/16.
 */
public class AirplanePagerAdapter extends FragmentStatePagerAdapter {
    private Context mContext;
    private List<Airplane> mValues;

    public AirplanePagerAdapter(FragmentManager fragmentManager, Context context, List<Airplane> values) {
        super(fragmentManager);
        mContext = context;
        mValues = values;
    }

    @Override
    public Fragment getItem(int position) {
        return AirplaneFragment.newInstance(mValues.get(position));
    }

    @Override
    public int getCount() {
        return mValues.size();
    }
}
