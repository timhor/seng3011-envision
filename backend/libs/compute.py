import os
import pandas as pd
import requests

def get_ts_daily_adjusted(instr):
    r = requests.get('https://www.alphavantage.co/query', params={
        'function': 'TIME_SERIES_DAILY_ADJUSTED',
        'symbol': instr,
        'apikey': os.environ['ALPHA_VANTAGE_API'],
        'outputsize': 'compact', # full
    })
    data = r.json()['Time Series (Daily)']
    df = pd.DataFrame(data)
    return df.T  # Need to transpose to make it look like a real dataset lmao
