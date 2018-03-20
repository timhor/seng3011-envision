import os
import pandas as pd
import numpy as np
import requests
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

    data_frame = pd.DataFrame.from_dict(data, orient='index')
    data_frame = data_frame.apply(pd.to_numeric)
    data_frame.index = pd.to_datetime(data_frame.index)

    # Because Alpha Vantage is offset incorrectly by 1, we need to fix it up
    data_frame.index += timedelta(days=1)
    return data_frame


def working_data(instr, target, lower, upper):
    """Creates an enriched dataset to work with"""
    data_frame = get_ts_daily_adjusted(instr)
    try:
        target_date = datetime.strptime(target, '%Y-%m-%d')
    except ValueError as e:
        raise e

    # Actual dates we are interested in
    lower_date = target_date - timedelta(days=lower)
    upper_date = target_date + timedelta(days=upper)

    # Specs want us to call more than that
    lower_date_extreme = target_date - timedelta(days=(2 * lower + 1))
    upper_date_extreme = target_date + timedelta(days=(2 * upper))

    # Tighten to the range we want (and show non-trading days too)
    data_frame = data_frame.reindex(pd.date_range(lower_date_extreme, upper_date_extreme, freq='D')).fillna(method='ffill')

    # Tag with relative dates
    data_frame = data_frame.apply(tag_relative_date, axis=1, args=(target_date, lower_date, upper_date))

    #  Calculate the data we want
    data_frame['Return'] = data_frame['4. close'].diff()
    data_frame['Return (%)'] = data_frame['4. close'].pct_change()

    add_performance(data_frame, lower, upper)

    return data_frame


def tag_relative_date(row, target, lower, upper):
    """Tags a row with it's relative distance from target date if we are interested in it"""
    row['Relative Date'] = (row.name - target).days if lower <= row.name <= upper else np.nan
    return row


def add_performance(data_frame, lower, upper):
    data_frame['CM Return'] = np.nan
    data_frame['AV Return'] = np.nan

    for i in range(len(data_frame)):
        if np.isnan(data_frame.iloc[i]['Relative Date']):
            continue
        else:
            data_frame['CM Return'].iloc[i] = data_frame['Return (%)'][i-lower:i+upper+1].sum()
            data_frame['AV Return'].iloc[i] = data_frame['CM Return'].iloc[i] / (lower + upper + 1)

def filter_data_frame(data_frame, vars):
    columns = ['Relative Date', 'Return'] + vars
    data_frame = data_frame[~np.isnan(data_frame['Relative Date'])]
    return data_frame[columns]

