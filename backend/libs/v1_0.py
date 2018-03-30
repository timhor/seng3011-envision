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

    df = get_ts_daily_adjusted(instr, adjusted=adjusted, full=full)
    df = working_data(df, target, lower, upper)
    if adjusted:
        add_advanced_data(df, lower, upper)
    add_performance(df, lower, upper)
    df = filter_data_frame(df, var_list)
    return df


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

    df = pd.DataFrame.from_dict(data, orient='index')
    df = df.apply(pd.to_numeric)
    df.index = pd.to_datetime(df.index)

    # Because Alpha Vantage is offset incorrectly by 1, we need to fix it up
    df.index += timedelta(days=1)
    return df


def working_data(df, target, lower, upper):
    """Creates an enriched dataset to work with"""

    # Actual dates we are interested in
    lower_date = target - timedelta(days=lower)
    upper_date = target + timedelta(days=upper)

    # Specs want us to call more than that
    lower_date_extreme = target - timedelta(days=(2 * lower + 1))
    upper_date_extreme = target + timedelta(days=(2 * upper))

    # Tighten to the range we want (and show non-trading days too)
    df = df.reindex(pd.date_range(lower_date_extreme, upper_date_extreme, freq='D'))
    if '5. volume' in df.columns:
        mapper = {'5. volume': 'Volume'}
    else:
        mapper = {'6. volume': 'Volume'}
    df = df.rename(columns=mapper)
    df['Volume'] = df['Volume'].fillna(0)
    df['4. close'] = df['4. close'].fillna(method='ffill')

    # Tag with relative dates
    df = df.apply(tag_relative_date, axis=1, args=(target, lower_date, upper_date))

    #  Calculate the data we want
    df['Return'] = df['4. close'].diff()
    df['Return_pct'] = df['4. close'].pct_change()
    df['Daily_Spread'] = df['2. high'] - df['3. low']
    df['Daily_Spread'] = df['Daily_Spread'].fillna(0)

    return df


def tag_relative_date(row, target, lower, upper):
    """Tags a row with it's relative distance from target date if we are interested in it"""
    row['Relative_Date'] = (row.name - target).days if lower <= row.name <= upper else np.nan
    return row


def add_performance(df, lower, upper):
    df['CM_Return'] = np.nan
    df['AV_Return'] = np.nan
    df['CM_Return_pct'] = np.nan
    df['AV_Return_pct'] = np.nan

    for i in range(len(df)):
        if np.isnan(df.iloc[i]['Relative_Date']):
            continue
        else:
            df['CM_Return'].iloc[i] = df['Return'][i - lower:i + upper + 1].sum()
            df['AV_Return'].iloc[i] = df['CM_Return'].iloc[i] / (lower + upper + 1)
            df['CM_Return_pct'].iloc[i] = df['Return_pct'][i - lower:i + upper + 1].sum()
            df['AV_Return_pct'].iloc[i] = df['CM_Return_pct'].iloc[i] / (lower + upper + 1)


def add_advanced_data(df, lower, upper):
    df['Volume_pct'] = np.nan

    for i in range(len(df)):
        if np.isnan(df.iloc[i]['Relative_Date']):
            continue
        else:
            df['Volume_pct'].iloc[i] = df['Volume'].iloc[i] / df['Volume'][i - lower:i + upper + 1].sum()


def filter_data_frame(df, vars):
    columns = ['Relative_Date', 'Return'] + vars
    df = df[~np.isnan(df['Relative_Date'])]
    return df[columns]


ADJUSTED_VARS = [
    'Volume',
    'Volume_pct',
]
