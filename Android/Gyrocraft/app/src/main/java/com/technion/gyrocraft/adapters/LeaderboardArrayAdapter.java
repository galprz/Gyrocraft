package com.technion.gyrocraft.adapters;

import android.content.Context;
import android.graphics.Color;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.R;

import java.util.List;
import java.util.Map;

/**
 * Created by Eliran_work on 5/4/2016.
 */
public class LeaderboardArrayAdapter extends ArrayAdapter<AssetsCache.Score> {

    private final Context context;
    private final List<AssetsCache.Score> values;

    public LeaderboardArrayAdapter(Context context, List<AssetsCache.Score> values) {
        super(context, R.layout.leaderboard_row, values);
        this.context = context;
        this.values = values;
    }
    @Override
    public boolean isEnabled(int position) {
        // TODO Auto-generated method stub

        return false;
    }
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) context
                .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View rowView = inflater.inflate(R.layout.leaderboard_row, parent, false);
        TextView posText = (TextView) rowView.findViewById(R.id.playerPosition);
        TextView nameText = (TextView) rowView.findViewById(R.id.playerName);
        TextView scoreText= (TextView) rowView.findViewById(R.id.playerScore);

        posText.setText(""+ (position+1));
        nameText.setText(values.get(position).Name);
        scoreText.setText(""+values.get(position).Score);

        if (position % 2 == 0)
            rowView.setBackgroundColor(Color.DKGRAY);
        else
            rowView.setBackgroundColor(Color.GRAY);

        return rowView;
    }
}

