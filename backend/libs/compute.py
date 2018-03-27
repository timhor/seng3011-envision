import os
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta, date


def parse_args(instr, target, var_list):
    try:
        instr = instr.split(',')
    except ValueError:
        instr = [instr]

    try:
        target = datetime.strptime(target, '%Y-%m-%d')
    except ValueError as e:
        raise e

    try:
        var_list = var_list.split(',')
    except ValueError:
        var_list = [var_list]

    return instr, target, var_list

def generate_table(instr, target, lower, upper, var_list):
    today = date.today()
    # TODO: Make this more specific
    if (today - target.date()).days > 100:
        # Need full data
        full = True
    else:
        full = False

    if [i for i in var_list if i in ADJUSTED_VARS]:
        adjusted = True
    else:
        adjusted = False

    data_frame = get_ts_daily_adjusted(instr, adjusted=adjusted, full=full)
    data_frame = working_data(data_frame, target, lower, upper)
    data_frame = filter_data_frame(data_frame, var_list)
    return data_frame


def get_ts_daily_adjusted(instr, adjusted=False, full=True):
    """Get data directly from Alpha Vantage"""
    target = 'TIME_SERIES_DAILY_ADJUSTED' if adjusted else 'TIME_SERIES_DAILY'
    output_size = 'full' if full else 'compact'

    r = requests.get('https://www.alphavantage.co/query', params={
        'function': target,
        'symbol': instr,
        'apikey': os.environ['ALPHA_VANTAGE_API'],
        'outputsize': output_size,
    })

    # Data comes with metadata that we don't need
    data = r.json()['Time Series (Daily)']

    data_frame = pd.DataFrame.from_dict(data, orient='index')
    data_frame = data_frame.apply(pd.to_numeric)
    data_frame.index = pd.to_datetime(data_frame.index)

    # Because Alpha Vantage is offset incorrectly by 1, we need to fix it up
    data_frame.index += timedelta(days=1)
    return data_frame


def working_data(data_frame, target, lower, upper):
    """Creates an enriched dataset to work with"""

    # Actual dates we are interested in
    lower_date = target - timedelta(days=lower)
    upper_date = target + timedelta(days=upper)

    # Specs want us to call more than that
    lower_date_extreme = target - timedelta(days=(2 * lower + 1))
    upper_date_extreme = target + timedelta(days=(2 * upper))

    # Tighten to the range we want (and show non-trading days too)
    data_frame = data_frame.reindex(pd.date_range(lower_date_extreme, upper_date_extreme, freq='D')).fillna(method='ffill')

    # Tag with relative dates
    data_frame = data_frame.apply(tag_relative_date, axis=1, args=(target, lower_date, upper_date))

    #  Calculate the data we want
    data_frame['Return'] = data_frame['4. close'].diff()
    data_frame['Return_pct'] = data_frame['4. close'].pct_change()

    add_performance(data_frame, lower, upper)

    return data_frame


def tag_relative_date(row, target, lower, upper):
    """Tags a row with it's relative distance from target date if we are interested in it"""
    row['Relative Date'] = (row.name - target).days if lower <= row.name <= upper else np.nan
    return row


def add_performance(data_frame, lower, upper):
    data_frame['CM_Return'] = np.nan
    data_frame['AV_Return'] = np.nan
    data_frame['CM_Return_pct'] = np.nan
    data_frame['AV_Return_pct'] = np.nan

    for i in range(len(data_frame)):
        if np.isnan(data_frame.iloc[i]['Relative Date']):
            continue
        else:
            data_frame['CM_Return'].iloc[i] = data_frame['Return'][i-lower:i+upper+1].sum()
            data_frame['AV_Return'].iloc[i] = data_frame['CM_Return'].iloc[i] / (lower + upper + 1)
            data_frame['CM_Return_pct'].iloc[i] = data_frame['Return_pct'][i - lower:i + upper + 1].sum()
            data_frame['AV_Return_pct'].iloc[i] = data_frame['CM_Return_pct'].iloc[i] / (lower + upper + 1)


def filter_data_frame(data_frame, vars):
    columns = ['Relative Date', 'Return'] + vars
    data_frame = data_frame[~np.isnan(data_frame['Relative Date'])]
    return data_frame[columns]


# Use this to tag what are valid parameters
BASE_VARS = [
    'Return',
    'Return_pct',
    'CM_Return',
    'CM_Return_pct',
    'AV_Return',
    'AV_Return_pct',
]

ADJUSTED_VARS = [
    'Volume',
    'Volume_pct'
]

VALID_VARS = BASE_VARS + ADJUSTED_VARS
