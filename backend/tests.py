import coverage
import os
import unittest
import requests
import json
from datetime import datetime, timedelta, date
import pandas as pd
import numpy as np
from threading import Lock
from libs import v1_0
from application import application
from importlib import reload


class TestCase(unittest.TestCase):
    def setUp(self):
        self.app = application.test_client()

    def tearDown(self):
        pass

    def test_1(self):
        url='/api/v1.0/?instrument_id=ABP.AX&date_of_interest=2012-12-10&list_of_var=Return,Return_pct,CM_Return,CM_Return_pct,AV_Return,AV_Return_pct,Daily_Spread,Volume,Volume_pct&lower_window=3&upper_window=5'
        response = self.app.get(url)
        actual_output = json.loads(response.get_data(as_text=True))
        with open('testfiles/test1_output.json','r') as test_file:
            expected_output = json.load(test_file)
        self.assertTrue(actual_output['Company_Returns'], expected_output['Company_Returns'])


class TestParseArgs(unittest.TestCase):
    def test_single_var(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['5']
        upper_window = ['6']
        result = v1_0.parse_args(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)

        self.assertEqual(result[0], ['CBA.AX'])
        self.assertEqual(result[1], datetime(2018, 4, 5))
        self.assertEqual(result[2], ['Return'])
        self.assertEqual(result[3], 5)
        self.assertEqual(result[4], 6)


    def test_multi_var(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return,CM_Return,Daily_Spread']
        lower_window = ['5']
        upper_window = ['6']
        result = v1_0.parse_args(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertEqual(result[0], ['CBA.AX'])
        self.assertEqual(result[1], datetime(2018, 4, 5))
        self.assertEqual(result[2], ['Return', 'CM_Return', 'Daily_Spread'])
        self.assertEqual(result[3], 5)
        self.assertEqual(result[4], 6)


    def test_multi_instr(self):
        instrument_id = ['CBA.AX,WOW.AX,MQG.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['5']
        upper_window = ['6']
        result = v1_0.parse_args(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertEqual(result[0], ['CBA.AX', 'WOW.AX', 'MQG.AX'])
        self.assertEqual(result[1], datetime(2018, 4, 5))
        self.assertEqual(result[2], ['Return'])
        self.assertEqual(result[3], 5)
        self.assertEqual(result[4], 6)


    def test_multi_instr_multi_vars(self):
        instrument_id = ['CBA.AX,WOW.AX,MQG.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return,CM_Return,Daily_Spread']
        lower_window = ['5']
        upper_window = ['6']
        result = v1_0.parse_args(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertEqual(result[0], ['CBA.AX', 'WOW.AX', 'MQG.AX'])
        self.assertEqual(result[1], datetime(2018, 4, 5))
        self.assertEqual(result[2], ['Return', 'CM_Return', 'Daily_Spread'])
        self.assertEqual(result[3], 5)
        self.assertEqual(result[4], 6)

    def test_multi_instr_spaces(self):
        instrument_id = ['CBA.AX  ,WOW .AX,     MQ G.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return,CM_Return,Daily_Spread']
        lower_window = ['5']
        upper_window = ['6']
        result = v1_0.parse_args(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertEqual(result[0], ['CBA.AX', 'WOW.AX', 'MQG.AX'])
        self.assertEqual(result[1], datetime(2018, 4, 5))
        self.assertEqual(result[2], ['Return', 'CM_Return', 'Daily_Spread'])
        self.assertEqual(result[3], 5)
        self.assertEqual(result[4], 6)

    def test_too_many_instr(self):
        instrument_id = ['1,2,3,4,6,7,8,9,10,11,12']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['5']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "Only a maximum of 10 instruments can be queried per request",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)

    def test_too_no_instr(self):
        instrument_id = ['']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['5']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "No instruments given",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)

    def test_bad_date_format(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018/04/05']
        list_of_var = ['Return']
        lower_window = ['5']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "date_of_interest needs to be in the correct format",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)


    def test_no_vars(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['']
        lower_window = ['5']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "No variables given",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)


    def test_invalid_var(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Fake']
        lower_window = ['5']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "Fake does not exist as a variable in list_of_var",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)

    def test_invalid_var2(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return,Fake']
        lower_window = ['5']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "Fake does not exist as a variable in list_of_var",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)


    def test_non_int_lower(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['hello']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "Window arguments must be integers",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)


    def test_non_int_upper(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['5']
        upper_window = ['hello']
        self.assertRaisesRegex(v1_0.ParamException, "Window arguments must be integers",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)


    def test_negative_lower(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['-1']
        upper_window = ['6']
        self.assertRaisesRegex(v1_0.ParamException, "Window arguments cannot be negative",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)


    def test_negative_upper(self):
        instrument_id = ['CBA.AX']
        date_of_interest = ['2018-04-05']
        list_of_var = ['Return']
        lower_window = ['5']
        upper_window = ['-1']
        self.assertRaisesRegex(v1_0.ParamException, "Window arguments cannot be negative",
            v1_0.parse_args,
            instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)


class TestGetTSDailyAdjusted(unittest.TestCase):
    def test_default_params(self):
        instrument_id = 'CBA.AX'
        df = v1_0.get_ts_daily_adjusted(instrument_id)
        self.assertEqual(df.index.name, 'timestamp')
        self.assertCountEqual(df.columns, ['open', 'high', 'low', 'close', 'volume'])

    def test_adj_full_false(self):
        instrument_id = 'CBA.AX'
        df = v1_0.get_ts_daily_adjusted(instrument_id, adjusted=False, full=False)
        self.assertEqual(df.index.name, 'timestamp')
        self.assertCountEqual(df.columns, ['open', 'high', 'low', 'close', 'volume'])

    def test_adj_full_true(self):
        instrument_id = 'CBA.AX'
        df = v1_0.get_ts_daily_adjusted(instrument_id, adjusted=True, full=True)
        self.assertEqual(df.index.name, 'timestamp')
        self.assertCountEqual(df.columns, ['open', 'high', 'low', 'close', 'adjusted_close', 'volume',
            'dividend_amount', 'split_coefficient'])

    def test_adj_true_full_false(self):
        instrument_id = 'CBA.AX'
        df = v1_0.get_ts_daily_adjusted(instrument_id, adjusted=True, full=False)
        self.assertEqual(df.index.name, 'timestamp')
        self.assertCountEqual(df.columns, ['open', 'high', 'low', 'close', 'adjusted_close', 'volume',
            'dividend_amount', 'split_coefficient'])


class TestGenerateTable(unittest.TestCase):
    def test_generate_table(self):
        instrument_id = 'CBA.AX'
        date_of_interest = datetime(2018, 4, 5)
        list_of_var = ['Return']
        lower_window = 5
        upper_window = 6
        df = v1_0.generate_table(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['Relative_Date', 'Return'])
        self.assertEqual(len(df[(df.Relative_Date < -5) & (df.Relative_Date > 6)]), 0)
        self.assertEqual(df.Relative_Date['2018-04-05'], 0)

    def test_generate_table_multi_var(self):
        instrument_id = 'CBA.AX'
        date_of_interest = datetime(2018, 4, 5)
        list_of_var = ['Return', 'Daily_Spread', 'CM_Return']
        lower_window = 5
        upper_window = 6
        df = v1_0.generate_table(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['Relative_Date', 'Return', 'Daily_Spread', 'CM_Return'])
        self.assertEqual(len(df[(df.Relative_Date < -5) & (df.Relative_Date > 6)]), 0)
        self.assertEqual(df.Relative_Date[date_of_interest], 0)

    def test_generate_table_recent(self):
        instrument_id = 'CBA.AX'
        date_of_interest = datetime.now() - timedelta(days=30)
        list_of_var = ['Return']
        lower_window = 5
        upper_window = 6
        df = v1_0.generate_table(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['Relative_Date', 'Return'])
        self.assertEqual(len(df[(df.Relative_Date < -5) & (df.Relative_Date > 6)]), 0)
        self.assertEqual(df.Relative_Date[date_of_interest], 0)

    def test_generate_table_old(self):
        instrument_id = 'CBA.AX'
        date_of_interest = datetime(2010, 1, 10)
        list_of_var = ['Volume']
        lower_window = 5
        upper_window = 6
        df = v1_0.generate_table(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['Relative_Date', 'Volume'])
        self.assertEqual(len(df[(df.Relative_Date < -5) & (df.Relative_Date > 6)]), 0)
        self.assertEqual(df.Relative_Date[date_of_interest], 0)


    def test_generate_table_recent_adjusted(self):
        instrument_id = 'CBA.AX'
        date_of_interest = datetime.now() - timedelta(days=30)
        list_of_var = ['Volume']
        lower_window = 5
        upper_window = 6
        df = v1_0.generate_table(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['Relative_Date', 'Volume'])
        self.assertEqual(len(df[(df.Relative_Date < -5) & (df.Relative_Date > 6)]), 0)
        self.assertEqual(df.Relative_Date[date_of_interest], 0)

    def test_generate_table_old_adjusted(self):
        instrument_id = 'CBA.AX'
        date_of_interest = datetime(2010, 1, 10)
        list_of_var = ['Volume']
        lower_window = 5
        upper_window = 6
        df = v1_0.generate_table(instrument_id, date_of_interest, list_of_var, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['Relative_Date', 'Volume'])
        self.assertEqual(len(df[(df.Relative_Date < -5) & (df.Relative_Date > 6)]), 0)
        self.assertEqual(df.Relative_Date[date_of_interest], 0)


class TestWorkingData(unittest.TestCase):
    with open('testfiles/raw_df.csv','r') as test_file:
        raw_df = pd.read_csv(test_file, index_col='timestamp')
        raw_df = raw_df.apply(pd.to_numeric)
        raw_df.index = pd.to_datetime(raw_df.index)
        raw_df.index += timedelta(days=1)

    def test_working_data(self):
        date_of_interest = datetime(2018, 4, 5)
        lower_window = 5
        upper_window = 6
        df= v1_0.working_data(self.raw_df, date_of_interest, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['open', 'high', 'low', 'close', 'adjusted_close', 'Volume',
            'dividend_amount', 'split_coefficient', 'Relative_Date', 'Return',
            'Return_pct', 'Daily_Spread'])
        expected_len = (lower_window * 2 + 1) + (upper_window * 2) + 1  # Includes date 0
        self.assertEqual(len(df), expected_len)
        self.assertEqual(df.Relative_Date[date_of_interest], 0)


    def test_working_data_older_date(self):
        date_of_interest = datetime(2015, 2, 1)
        lower_window = 5
        upper_window = 6
        df= v1_0.working_data(self.raw_df, date_of_interest, lower_window, upper_window)
        self.assertCountEqual(df.columns, ['open', 'high', 'low', 'close', 'adjusted_close', 'Volume',
            'dividend_amount', 'split_coefficient', 'Relative_Date', 'Return',
            'Return_pct', 'Daily_Spread'])
        expected_len = (lower_window * 2 + 1) + (upper_window * 2) + 1  # Includes date 0
        self.assertEqual(len(df), expected_len)
        self.assertEqual(df.Relative_Date[date_of_interest], 0)

class TestTagRelativeDate(unittest.TestCase):
    def test_relative_date_within(self):
        row = pd.Series(data={
            'test': 0
        }, name=pd.to_datetime('2018-04-05'))
        date_of_interest = datetime(2018, 4, 5)
        lower_window = date_of_interest + timedelta(days=-5)
        upper_window = date_of_interest + timedelta(days=6)
        row = v1_0.tag_relative_date(row, date_of_interest, lower_window, upper_window)
        self.assertEqual(row.Relative_Date, 0)

    def test_relative_date_outside(self):
        row = pd.Series(data={
            'test': 0
        }, name=pd.to_datetime('2017-04-05'))
        date_of_interest = datetime(2018, 4, 5)
        lower_window = date_of_interest + timedelta(days=-5)
        upper_window = date_of_interest + timedelta(days=6)
        row = v1_0.tag_relative_date(row, date_of_interest, lower_window, upper_window)
        self.assertTrue(np.isnan(row.Relative_Date))

    def test_relative_date_lower_edge(self):
        row = pd.Series(data={
            'test': 0
        }, name=pd.to_datetime('2018-03-31'))
        date_of_interest = datetime(2018, 4, 5)
        lower_window = date_of_interest + timedelta(days=-5)
        upper_window = date_of_interest + timedelta(days=6)
        row = v1_0.tag_relative_date(row, date_of_interest, lower_window, upper_window)
        self.assertEqual(row.Relative_Date, -5)

    def test_relative_date_upper_edge(self):
        row = pd.Series(data={
            'test': 0
        }, name=pd.to_datetime('2018-04-11'))
        date_of_interest = datetime(2018, 4, 5)
        lower_window = date_of_interest + timedelta(days=-5)
        upper_window = date_of_interest + timedelta(days=6)
        row = v1_0.tag_relative_date(row, date_of_interest, lower_window, upper_window)
        self.assertEqual(row.Relative_Date, 6)


class TestAddPerformance(unittest.TestCase):
    def test_add_performance(self):
        lower_window = 5
        upper_window = 6
        # date_of_interest = '2018-04-05'
        with open('testfiles/working_data.csv','r') as test_file:
            df = pd.read_csv(test_file, index_col='timestamp')
        v1_0.add_performance(df, lower_window, upper_window)
        for i in ('CM_Return', 'AV_Return', 'CM_Return_pct', 'AV_Return_pct'):
            self.assertIn(i, df.columns)
            self.assertFalse(np.isnan(df[i]['2018-04-05']))
            self.assertTrue(np.isnan(df[i]['2018-03-30']))
            self.assertTrue(np.isnan(df[i]['2018-04-12']))


class TestAddAdvancedData(unittest.TestCase):
    def test_add_advanced_data(self):
        lower_window = 5
        upper_window = 6
        # date_of_interest = '2018-04-05'
        with open('testfiles/working_data.csv','r') as test_file:
            df = pd.read_csv(test_file, index_col='timestamp')
        v1_0.add_advanced_data(df, lower_window, upper_window)
        for i in ('Volume_pct',):
            self.assertIn(i, df.columns)
            self.assertFalse(np.isnan(df[i]['2018-04-05']))
            self.assertTrue(np.isnan(df[i]['2018-03-30']))
            self.assertTrue(np.isnan(df[i]['2018-04-12']))


class TestFilterDataFrame(unittest.TestCase):
    # date_of_interest = '2018-04-05'
    lower_window = 5  # Defined in the given dataset
    upper_window = 6  # Defined in the given dataset
    with open('testfiles/perf_data.csv','r') as test_file:
        df = pd.read_csv(test_file, index_col='timestamp')

    def test_filter_data_frame(self):
        result = v1_0.filter_data_frame(self.df, ['Return'])
        self.assertCountEqual(result.columns, ['Relative_Date', 'Return'])
        expected_len = self.lower_window + self.upper_window + 1
        self.assertEqual(len(result), expected_len)

    def test_filter_data_frame_many_var(self):
        result = v1_0.filter_data_frame(self.df, ['Return', 'CM_Return_pct', 'Daily_Spread', 'Volume', 'AV_Return'])
        self.assertCountEqual(result.columns,
            ['Relative_Date', 'Return', 'CM_Return_pct', 'Daily_Spread', 'Volume', 'AV_Return'])
        expected_len = self.lower_window + self.upper_window + 1
        self.assertEqual(len(result), expected_len)

    def test_filter_data_frame_no_var(self):
        result = v1_0.filter_data_frame(self.df, [])
        self.assertCountEqual(result.columns, ['Relative_Date'])
        expected_len = self.lower_window + self.upper_window + 1
        self.assertEqual(len(result), expected_len)


class TestListedDict(unittest.TestCase):
    # Defined in the given dataset
    lower_window = 5
    upper_window = 6
    list_of_var = ['Return', 'AV_Return', 'AV_Return_pct', 'Daily_Spread', 'Volume']
    with open('testfiles/output_data.csv','r') as test_file:
        df = pd.read_csv(test_file, index_col='timestamp')

    def test_listed_dict(self):
        data = v1_0.listed_dict(self.df)
        # Dates are in ascending order
        self.assertTrue(all(x['Date'] < y['Date'] for x, y in zip(data, data[1:])))
        for i in data:
            self.assertCountEqual(i.keys(), ['Date', 'Relative_Date'] + self.list_of_var)


class TestCalcIndividualReturn(unittest.TestCase):
    def test_calc_normal(self):
        instrument_id = 'CBA.AX'
        date_of_interest = datetime(2018, 4, 5)
        list_of_var = ['Return', 'CM_Return', 'Daily_Spread']
        lower_window = 5
        upper_window = 6
        lock = Lock()
        returns = []
        error_messages = []
        v1_0.calc_individual_returns(instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window,
            returns,
            error_messages,
            lock)
        self.assertFalse(error_messages)
        self.assertTrue(len(returns), len(instrument_id))
        self.assertCountEqual([i['InstrumentID'] for i in returns], ['CBA.AX'])

class TestCalculateReturns(unittest.TestCase):
    def test_calc_returns_single(self):
        instrument_id = ['CBA.AX']
        date_of_interest = datetime(2018, 4, 5)
        list_of_var = ['Return', 'CM_Return', 'Daily_Spread']
        lower_window = 5
        upper_window = 6
        returns, errors = v1_0.calculate_returns(instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)
        self.assertFalse(errors)
        self.assertTrue(len(returns), len(instrument_id))
        self.assertCountEqual([i['InstrumentID'] for i in returns], instrument_id)


    def test_calc_returns_multi(self):
        instrument_id = ['CBA.AX', 'WOW.AX', 'MQG.AX']
        date_of_interest = datetime(2018, 4, 5)
        list_of_var = ['Return', 'CM_Return', 'Daily_Spread']
        lower_window = 5
        upper_window = 6
        returns, errors = v1_0.calculate_returns(instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)
        self.assertFalse(errors)
        self.assertEqual(len(returns), len(instrument_id))
        self.assertCountEqual([i['InstrumentID'] for i in returns], instrument_id)


    def test_calc_returns_bad_instr(self):
        instrument_id = ['FAKEINSTR']
        date_of_interest = datetime(2018, 4, 5)
        list_of_var = ['Return', 'CM_Return', 'Daily_Spread']
        lower_window = 5
        upper_window = 6
        returns, errors = v1_0.calculate_returns(instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)
        self.assertEqual(len(errors), 1)
        self.assertEqual(len(returns), 1)
        for i in errors:
            self.assertRegex(i, r'Error: .* does not exist')


    def test_calc_returns_mix(self):
        instrument_id = ['FAKEINSTR', 'CBA.AX', 'BADNAME', 'WOW.AX']
        date_of_interest = datetime(2018, 4, 5)
        list_of_var = ['Return', 'CM_Return', 'Daily_Spread']
        lower_window = 5
        upper_window = 6
        returns, errors = v1_0.calculate_returns(instrument_id,
            date_of_interest,
            list_of_var,
            lower_window,
            upper_window)
        self.assertEqual(len(errors), 2)
        self.assertEqual(len(returns), 4)
        self.assertCountEqual([i['InstrumentID'] for i in returns], instrument_id)
        for i in errors:
            self.assertRegex(i, r'^Error: .* does not exist')


if __name__ == '__main__':
    cov = coverage.Coverage(branch=True, omit=[
        'flask/*',
        'tests.py',
        '/home/travis/virtualenv/python3.6.3/lib/python3.6/site-packages/*',
        '~/.local/share/virtualenvs/backend-sK7bS5JP/lib/python3.6/site-packages/*',
        '~/virtualenvs/backend-bSxktZG6/lib/python3.6/site-packages/*'
    ])
    cov.start()

    # Reloaded here to be within the coverage reporting
    reload(v1_0)
    from libs import views
    reload(views)

    try:
        unittest.main()
    except:
        pass
    cov.stop()
    cov.report(show_missing=True)
    cov.save()
    cov.html_report(directory="coverage_report")
