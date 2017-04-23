package com.technion.gyrocraft.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.technion.gyrocraft.Airplane;
import com.technion.gyrocraft.R;

import java.util.List;

/**
 * Created by galmalka on 4/9/16.
 */
public class AirplaneArrayAdapter extends ArrayAdapter<Airplane> {
    private final Context mContext;
    private final List<Airplane> mValues;

    public AirplaneArrayAdapter(Context context, List<Airplane> values) {
        super(context, R.layout.airplane_row, values);
        mContext = context;
        mValues = values;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View rowView = inflater.inflate(R.layout.airplane_row, parent, false);
        TextView name = (TextView) rowView.findViewById(R.id.airplane_list_name);
        ImageView image = (ImageView) rowView.findViewById(R.id.airplane_list_image);

        name.setText(mValues.get(position).getName());
        int smallImageId = getContext().getResources().getIdentifier(mValues.get(position).getSmallImageName(), "drawable", getContext().getPackageName());
        image.setImageResource(smallImageId);
        return rowView;
    }
}
