import coverage
import os
import unittest
import requests
import json
from libs import v1_0
from datetime import datetime, timedelta, date

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

class TestBlackBox(unittest.TestCase):
    # def test_success_queries(self):
    #     instr = ["ABP.AX"]
    #     date ="2012-12-10"
    #     var = ["CM_Return"]
    #     upper = 5
    #     lower = 3
    #     url = f'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id={",".join(instr)}&date_of_interest={date}&list_of_var={",".join(var)}&lower_window={lower}&upper_window={upper}'
    #     self._check_envision_success(instr, date, var, upper, lower, url)

    #     url = f'http://team-distribution.info/api/v2/returns?id={",".join(instr)}&date={date}&varlist={",".join(var)}&lower={lower}&upper={upper}'
    #     self._check_distribution_success(instr, date, var, upper, lower, url)

    #     url = f'http://128.199.82.8:8000/api_v2/api?id={",".join(instr)}&date={date}&type={",".join(var)}&upper_window={upper}&lower_window={lower}'
    #     self._check_optiver_success(instr, date, var, upper, lower, url)

    # All Empty Parameters
    def test_all_empty_parameters(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id=&date_of_interest=&list_of_var=&lower_window=&upper_window='
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=&date=&varlist=&lower=&upper='
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=&date=&type=&upper_window=&lower_window='
        self._check_optiver_failed(url)

    # Instrument ID Removed
    def test_instrument_id_removed(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id=&date_of_interest=2012-12-10&list_of_var=CM_Return&lower_window=3&upper_window=5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=&date=2012-12-10&varlist=CM_Return&lower=3&upper=5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=&date=2012-12-10&type=cureturn&upper_window=5&lower_window=3'
        self._check_optiver_failed(url)

    # Date of Interest Removed
    def test_date_removed(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id=ABP.AX&date_of_interest=&list_of_var=CM_Return&lower_window=3&upper_window=5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=ABP.AX&date=&varlist=CM_Return&lower=3&upper=5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=ABP.AX&date=&type=cureturn&upper_window=5&lower_window=3'
        self._check_optiver_failed(url)

    # Variables List Removed
    def test_variables_removed(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id=ABP.AX&date_of_interest=2012-12-10&list_of_var=&lower_window=3&upper_window=5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=ABP.AX&date=2012-12-10&varlist=&lower=3&upper=5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=ABP.AX&date=2012-12-10&type=&upper_window=5&lower_window=3'
        self._check_optiver_failed(url)

    # Lower Window Removed
    def test_lower_removed(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id=ABP.AX&date_of_interest=2012-12-10&list_of_var=CM_Return&lower_window=&upper_window=5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=ABP.AX&date=2012-12-10&varlist=CM_Return&lower=&upper=5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=ABP.AX&date=2012-12-10&type=cureturn&upper_window=5&lower_window='
        self._check_optiver_failed(url)

    # Upper Window Removed
    def test_upper_removed(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id=ABP.AX&date_of_interest=2012-12-10&list_of_var=CM_Return&lower_window=3&upper_window='
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=ABP.AX&date=2012-12-10&varlist=CM_Return&lower=3&upper='
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=ABP.AX&date=2012-12-10&type=cureturn&upper_window=&lower_window=3'
        self._check_optiver_failed(url)


    # Negative Windows
    def test_negative_windows(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/?instrument_id=ABP.AX&date_of_interest=2012-12-10&list_of_var=Return&lower_window=-3&upper_window=-5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=ABP.AX&date=2012-12-10&varlist=CM_Return&lower=-3&upper=-5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=ABP.AX&date=2012-12-10&type=cureturn&upper_window=-5&lower_window=-3'
        self._check_optiver_failed(url)

    # Non-existing Instrument ID
    def test_non_existing_instr_ID(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/?instrument_id=SENG&date_of_interest=2012-12-10&list_of_var=Return&lower_window=3&upper_window=5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=SENG&date=2012-12-10&varlist=CM_Return&lower=3&upper=5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=SENG&date=2012-12-10&type=cureturn&upper_window=5&lower_window=3'
        self._check_optiver_failed(url)

    # Non-existing API Version
    def test_non_existing_api_version(self):
        try:
            url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v99.99/?instrument_id=ABP.AX&date_of_interest=2012-12-10&list_of_var=Return&lower_window=3&upper_window=5'
            self._check_envision_failed(url)
        except:
            print ("--##--##--EXCEPTION PRODUCED Envision--##--##--")

        try:
            url = 'http://team-distribution.info/api/v99.99/returns?id=ABP.AX&date=2012-12-10&varlist=CM_Return&lower=3&upper=5'
            self._check_distribution_failed(url)
        except:
            print ("--##--##--EXCEPTION PRODUCED Team Distribution--##--##--")

        try:
            url = 'http://128.199.82.8:8000/api_v99.99/api?id=ABP.AX&date=2012-12-10&type=cureturn&upper_window=5&lower_window=3'
            self._check_optiver_failed(url)
        except:
            print ("--##--##--EXCEPTION PRODUCED Optiver Prime--##--##--")

    # Previous API Version
    def test_prev_api_version(self):
        instr = ["ABP.AX"]
        date ="2012-12-10"
        env_dist_var = ["CM_Return"]
        optiver_var = ["cureturn"]
        upper = 5
        lower = 3
        url = f'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.0/?instrument_id={",".join(instr)}&date_of_interest={date}&list_of_var={",".join(env_dist_var)}&lower_window={lower}&upper_window={upper}'
        self._check_envision_success(instr, date, env_dist_var, upper, lower, url)

        url = f'http://team-distribution.info/api/v1/returns?id={",".join(instr)}&date={date}&varlist={",".join(env_dist_var)}&lower={lower}&upper={upper}'
        self._check_distribution_success(instr, date, env_dist_var, upper, lower, url)

        url = f'http://128.199.82.8:8000/api_v1/api?id={",".join(instr)}&date={date}&type={",".join(optiver_var)}&upper_window={upper}&lower_window={lower}'
        self._check_optiver_success(instr, date, optiver_var, upper, lower, url)

    # Dates in the future
    def test_future_dates(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/?instrument_id=ABP.AX&date_of_interest=2018-12-12&list_of_var=Return&lower_window=3&upper_window=5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=ABP.AX&date=2018-12-12&varlist=CM_Return&lower=3&upper=5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=ABP.AX&date=2018-12-12&type=cureturn&upper_window=5&lower_window=3'
        self._check_optiver_failed(url)

    # Potentially dangerous parameters
    def test_dangerous_parameters(self):
        url = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/?instrument_id=");DROP%20TABLE%20RETURNS;--&date_of_interest=2012-12-10&list_of_var=Return&lower_window=3&upper_window=5'
        self._check_envision_failed(url)

        url = 'http://team-distribution.info/api/v2/returns?id=");DROP%20TABLE%20RETURNS;--&date=2012-12-10&varlist=CM_Return&lower=3&upper=5'
        self._check_distribution_failed(url)

        url = 'http://128.199.82.8:8000/api_v2/api?id=");DROP%20TABLE%20RETURNS;--&date=2012-12-10&type=none&upper_window=5&lower_window=3'
        self._check_optiver_failed(url)

    # Normal input
    def test_normal_input(self):
        instr = ["ABP.AX"]
        date ="2012-12-10"
        env_dist_var = ["CM_Return"]
        optiver_var = ["cureturn"]
        upper = 5
        lower = 3
        url = f'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id={",".join(instr)}&date_of_interest={date}&list_of_var={",".join(env_dist_var)}&lower_window={lower}&upper_window={upper}'
        self._check_envision_success(instr, date, env_dist_var, upper, lower, url)

        url = f'http://team-distribution.info/api/v2/returns?id={",".join(instr)}&date={date}&varlist={",".join(env_dist_var)}&lower={lower}&upper={upper}'
        self._check_distribution_success(instr, date, env_dist_var, upper, lower, url)

        url = f'http://128.199.82.8:8000/api_v2/api?id={",".join(instr)}&date={date}&type={",".join(optiver_var)}&upper_window={upper}&lower_window={lower}'
        self._check_optiver_success(instr, date, optiver_var, upper, lower, url)

    # Multiple Variables
    def test_multiple_variables(self):
        instr = ["ABP.AX"]
        date ="2012-12-10"
        env_var = ["Return", "CM_Return", "AV_Return"]
        dist_var = ["CM_Return", "AV_Return"]
        optiver_var = ["cureturn", "avreturn"]
        upper = 5
        lower = 3
        url = f'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id={",".join(instr)}&date_of_interest={date}&list_of_var={",".join(env_var)}&lower_window={lower}&upper_window={upper}'
        self._check_envision_success(instr, date, env_var, upper, lower, url)

        url = f'http://team-distribution.info/api/v2/returns?id={",".join(instr)}&date={date}&varlist={",".join(dist_var)}&lower={lower}&upper={upper}'
        self._check_distribution_success(instr, date, dist_var, upper, lower, url)

        url = f'http://128.199.82.8:8000/api_v2/api?id={",".join(instr)}&date={date}&type={",".join(optiver_var)}&upper_window={upper}&lower_window={lower}'
        self._check_optiver_success(instr, date, optiver_var, upper, lower, url)


    def _check_envision_success(self, instr, date, var, upper, lower, url):
        url = requests.get(url)
        output = url.json()

        self.assertEqual(output['Metadata']['success'], True)

        param = output['Metadata']['parameters']
        self.assertEqual(param['date_of_interest'], date)

        index = 0
        for v in var:
            self.assertEqual(param['list_of_var'][index], v)
            index += 1

        self.assertEqual(param['upper_window'], upper)
        self.assertEqual(param['lower_window'], lower)

        index = 0
        date = datetime.strptime(date, '%Y-%m-%d') - timedelta(days=lower)
        for i in instr:
            self.assertEqual(param['instrument_id'][index], i)
            self.assertEqual(output['Company_Returns'][index]['InstrumentID'], i)
            data = output['Company_Returns'][index]['Data']

            self.assertEqual(len(data), upper+lower+1)
            date_range = date
            for j in range(0, len(data)):
                self.assertEqual(data[j]['Date'], date_range.strftime('%Y-%m-%d'))
                for v in var:
                    self.assertIsNotNone(data[j][v])
                date_range = date_range + timedelta(days=1)
            index += 1

    def _check_distribution_success(self, instr, date, var, upper, lower, url):
        url = requests.get(url)
        output = url.json()

        self.assertEqual(output['ok'], True)

        param = output['request']
        self.assertEqual(param['date'], date)
        self.assertEqual(param['varlist'], ','.join(var))
        self.assertEqual(param['upper'], str(upper))
        self.assertEqual(param['lower'], str(lower))

        # convert valid vars to dict keys which exists in json output
        for i in range(0, len(var)):
            if var[i] == "CM_Return":
                var[i] = "CM_returns"
            elif var[i] == "AV_Return":
                var[i] = "AV_returns"

        date = datetime.strptime(date, '%Y-%m-%d') - timedelta(days=lower)
        for i in instr:
            self.assertEqual(param['id'], i)
            self.assertEqual(output['data']['id'], i)
            data = output['data']['entries']

            self.assertEqual(len(data), upper+lower+1)
            date_range = date
            for key in data.keys():
                self.assertEqual(key, date_range.strftime('%Y-%m-%d'))
                for v in var:
                    self.assertIsNotNone(data[key][v])
                date_range = date_range + timedelta(days=1)

    def _check_optiver_success(self, instr, date, var, upper, lower, url):
        url = requests.get(url)
        output = url.json()

        self.assertEqual(output['Log'][0]['Success'], True)

        param = output['Log'][0]['Parameters']
        self.assertEqual(param['Date'], date)
        self.assertEqual(param['Return Type'], ','.join(var))
        self.assertEqual(param['Upper Window'], str(upper))
        self.assertEqual(param['Lower Window'], str(lower))

        for i in range(0, len(var)):
            if var[i] == "cureturn":
                var[i] = "cumulative_return"
            elif var[i] == "avreturn":
                var[i] = "average_return"

        date = datetime.strptime(date, '%Y-%m-%d') + timedelta(days=upper) #Group sorts dates in reverse
        for i in instr:
            self.assertEqual(param['Instrument ID'], i)
            self.assertEqual(output['CompanyReturns'][0]['InstrumentID'], i)
            data = output['CompanyReturns'][0]['Data']

            date_range = date
            self.assertEqual(len(data), upper+lower+1)
            for j in range(0, len(data)):
                self.assertEqual(data[j]['date'], date_range.strftime('%Y-%m-%d'))
                for v in var:
                    self.assertIsNotNone(data[j][v])
                date_range = date_range - timedelta(days=1)

    def _check_envision_failed(self, url):
        url = requests.get(url)
        output = url.json()

        self.assertEqual(output['Metadata']['success'], False)
        self.assertIsNotNone(output['Metadata']['error_messages'])

    def _check_distribution_failed(self, url):
        url = requests.get(url)
        output = url.json()

        self.assertEqual(output['ok'], False)
        self.assertIsNotNone(output['error'])

    def _check_optiver_failed(self, url):
        url = requests.get(url)
        output = url.json()

        self.assertEqual(output['Log'][0]['Success'], False)
        self.assertIsNotNone(output['Log'][0]['Error']) # No error messages provided


if __name__ == '__main__':
    cov = coverage.Coverage(branch=True, omit=['flask/*','tests.py', '/home/travis/virtualenv/python3.6.3/lib/python3.6/site-packages/*'])
    cov.start()
    try:
        unittest.main()
    except:
        pass
    cov.stop()
    cov.report(show_missing=True)
    cov.save()
