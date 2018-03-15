import os
import pandas as pd
import numpy as np
import requests
import math
from datetime import datetime, timedelta


def get_ts_daily_adjusted(instr):
    """Get data directly from Alpha Vantage"""
    r = requests.get('https://www.alphavantage.co/query', params={
        'function': 'TIME_SERIES_DAILY',  # Don't need their adjusted after all
        'symbol': instr,
        'apikey': os.environ['ALPHA_VANTAGE_API'],
        'outputsize': 'full',  # Alternative: compact
    })

    # Data comes with metadata that we don't need
    data = r.json()['Time Series (Daily)']

    df = pd.DataFrame.from_dict(data, orient='index')
    df = df.apply(pd.to_numeric)
    df.index = pd.to_datetime(df.index)
    return df


def working_data(instr, target, lower, upper):
    """Creates an enriched dataset to work with"""
    df = get_ts_daily_adjusted(instr)
    try:
        target_date = datetime.strptime(target, '%d/%m/%Y')
    except ValueError as e:
        raise e

    # Actual dates we are interested in
    lower_date = target_date - timedelta(days=lower)
    upper_date = target_date + timedelta(days=upper)

    # Specs want us to call more than that
    lower_date_extreme = target_date - timedelta(days=(2 * lower + 1))
    upper_date_extreme = target_date + timedelta(days=(2 * upper))

    # Tighten to the range we want (and show non-trading days too)
    df = df.reindex(pd.date_range(lower_date_extreme, upper_date_extreme, freq='D')).fillna(method='bfill')
    #     df = df[(df.index >= lower_date_extreme) & (df.index <= upper_date_extreme)]

    # Tag with relative dates
    df = df.apply(tag_relative_date, axis=1, args=(target_date, lower_date, upper_date))

    #  Calculate the data we want
    #     df['Return'] = df['5. adjusted close'].diff()
    #     df['Return (%)'] = df['5. adjusted close'].pct_change()
    df['Return'] = df['4. close'].diff()
    df['Return (%)'] = df['4. close'].pct_change()


    return df



def cm_return(df):
    i = 0
    cm = 0.0
    while i < len(df):
        val = df['Return'][i]
        # check to see if val is not nan
        if not math.isnan(val):
            cm += df['Return'][i]
        i += 1
    return cm


def av_return(df):
    return cm_return(df)/len(df)


def tag_relative_date(row, target, lower, upper):
    """Tags a row with it's relative distance from target date if we are interested in it"""
    row['Relative Date'] = (row.name - target).days if lower <= row.name <= upper else np.nan
    return row

