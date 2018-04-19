import os
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta, date

class ParamException(Exception):
    pass


VALID_VARS = {
    'Return': 'Return',
    'Return_pct': 'Return Percentage',
    'CM_Return': 'Cumulative Return',
    'CM_Return_pct': 'Cumulative Return Percentage',
    'AV_Return': 'Average Return',
    'AV_Return_pct': 'Average Return Percentage',
    'Volume': 'Volume',
    'Volume_pct': 'Volume Percentage',
    'Daily_Spread': 'Daily Spread',
}

def listed_dict(df):
    info_list = []
    for i in df.iterrows():
        info = {'Date': i[0]}
        info.update(i[1].to_dict())
        info_list.append(info)
    return info_list


def parse_args(instrument_id, date_of_interest, list_of_var, lower_window, upper_window, **kwargs):
    # Instrument
    try:
        if len(instrument_id[0]) == 0:
            raise ParamException("No instruments given")
        instr = instrument_id[0].split(',')
        if len(instr) > 10:
            raise ParamException("Only a maximum of 10 instruments can be queried per request")
    except ValueError:
        instr = instrument_id

    # Date
    try:
        target = datetime.strptime(date_of_interest[0], '%Y-%m-%d')
    except ValueError:
        raise ParamException("date_of_interest needs to be in the correct format")

    # Vars
    try:
        if len(list_of_var[0]) == 0:
            raise ParamException("No variables given")
        var_list = list_of_var[0].split(',')
    except ValueError:
        var_list = list_of_var

    for i in var_list:
        if i not in VALID_VARS.keys():
            raise ParamException(f"{i} does not exist as a variable in list_of_var")

    # Windows
    try:
        lower = int(lower_window[0])
        upper = int(upper_window[0])
    except ValueError:
        raise ParamException("Window arguments must be integers")

    if lower < 0 or upper < 0:
        raise ParamException("Window arguments cannot be negative")

    # TODO: Add in date range limit?

    return instr, target, var_list, lower, upper


def calculate_returns(instrument_id, date_of_interest, list_of_var, lower_window, upper_window):
    returns = []
    error_messages = []
    for i in instrument_id:
        i = i.strip()
        try:
            df = generate_table(i, date_of_interest, list_of_var, lower_window, upper_window)
            df.index = df.index.format()
            data = listed_dict(df)

        except KeyError as e:
            data = f"Error: {i} does not exist"
            error_messages.append(data)
        except Exception as e:
            data = "Error: " + str(e)
            print(data)
            error_messages.append(data)

        returns.append({
            'InstrumentID': i,
            'Data': data
        })
    return returns, error_messages


def generate_table(instrument_id, date_of_interest, list_of_var, lower_window, upper_window):
    today = date.today()
    # TODO: Make this more specific
    if (today - date_of_interest.date()).days > 100:
        # Need full data
        full = True
    else:
        full = False

    if [i for i in list_of_var if i in ADJUSTED_VARS]:
        adjusted = True
    else:
        adjusted = False

    df = get_ts_daily_adjusted(instrument_id, adjusted=adjusted, full=full)
    df = working_data(df, date_of_interest, lower_window, upper_window)
    if adjusted:
        add_advanced_data(df, lower_window, upper_window)
    add_performance(df, lower_window, upper_window)
    df = filter_data_frame(df, list_of_var)
    return df


def get_ts_daily_adjusted(instrument_id, adjusted=False, full=True):
    """Get data directly from Alpha Vantage"""
    target = 'TIME_SERIES_DAILY_ADJUSTED' if adjusted else 'TIME_SERIES_DAILY'
    output_size = 'full' if full else 'compact'

    # NEW
    r = requests.get('https://www.alphavantage.co/query', params={
        'function': target,
        'symbol': instrument_id,
        'apikey': os.environ['ALPHA_VANTAGE_API'],
        'outputsize': output_size,
        'datatype': 'csv',
    })

    df = pd.read_csv(pd.compat.StringIO(r.text), index_col='timestamp')
    df = df.apply(pd.to_numeric)
    df.index = pd.to_datetime(df.index)
    df.index += timedelta(days=1)
    return df



def working_data(df, date_of_interest, lower_window, upper_window):
    """Creates an enriched dataset to work with"""

    # Actual dates we are interested in
    lower_date = date_of_interest - timedelta(days=lower_window)
    upper_date = date_of_interest + timedelta(days=upper_window)

    # Specs want us to call more than that
    lower_date_extreme = date_of_interest - timedelta(days=(2 * lower_window + 1))
    upper_date_extreme = date_of_interest + timedelta(days=(2 * upper_window))

    # Tighten to the range we want (and show non-trading days too)
    df = df.reindex(pd.date_range(lower_date_extreme, upper_date_extreme, freq='D'))
    df = df.rename(columns={'volume': 'Volume'})
    df['Volume'] = df['Volume'].fillna(0)
    df['close'] = df['close'].fillna(method='ffill')

    # Tag with relative dates
    df = df.apply(tag_relative_date, axis=1, args=(date_of_interest, lower_date, upper_date))

    #  Calculate the data we want
    df['Return'] = df['close'].diff()
    df['Return_pct'] = df['close'].pct_change()
    df['Daily_Spread'] = df['high'] - df['low']
    df['Daily_Spread'] = df['Daily_Spread'].fillna(0)

    return df


def tag_relative_date(row, date_of_interest, lower_window, upper_window):
    """Tags a row with it's relative distance from date_of_interest if we are interested in it"""
    row['Relative_Date'] = (row.name - date_of_interest).days if lower_window <= row.name <= upper_window else np.nan
    return row


def add_performance(df, lower_window, upper_window):
    df['CM_Return'] = np.nan
    df['AV_Return'] = np.nan
    df['CM_Return_pct'] = np.nan
    df['AV_Return_pct'] = np.nan

    for i in range(len(df)):
        if np.isnan(df.iloc[i]['Relative_Date']):
            continue
        else:
            df['CM_Return'].iloc[i] = df['Return'][i - lower_window:i + upper_window + 1].sum()
            df['AV_Return'].iloc[i] = df['CM_Return'].iloc[i] / (lower_window + upper_window + 1)
            df['CM_Return_pct'].iloc[i] = df['Return_pct'][i - lower_window:i + upper_window + 1].sum()
            df['AV_Return_pct'].iloc[i] = df['CM_Return_pct'].iloc[i] / (lower_window + upper_window + 1)


def add_advanced_data(df, lower_window, upper_window):
    df['Volume_pct'] = np.nan

    for i in range(len(df)):
        if np.isnan(df.iloc[i]['Relative_Date']):
            continue
        else:
            df['Volume_pct'].iloc[i] = df['Volume'].iloc[i] / df['Volume'][i - lower_window:i + upper_window + 1].sum()


def filter_data_frame(df, list_of_var):
    columns = ['Relative_Date'] + list_of_var
    df = df[~np.isnan(df['Relative_Date'])]
    return df[columns]


ADJUSTED_VARS = [
    'Volume',
    'Volume_pct',
]
