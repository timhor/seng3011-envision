import coverage
import os
import unittest
import requests
import json
from libs import v1_0
from datetime import datetime, timedelta
import pandas as pd

from application import application

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
        assert(actual_output['Company_Returns'] == expected_output['Company_Returns'])


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



if __name__ == '__main__':
    # cov = coverage.Coverage(branch=True, omit=['flask/*','tests.py', '/home/travis/virtualenv/python3.6.3/lib/python3.6/site-packages/*'])
    # cov.start()
    try:
        unittest.main()
    except:
        pass
    # cov.stop()
    # cov.report(show_missing=True)
    # cov.save()
