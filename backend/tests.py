import coverage
import os
import unittest
import requests
import json
from libs import v1_0

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
    def test_success_queries(self):
        instr = ["ABP.AX"]
        date="2012-12-10"
        var= ["Return"]
        upper=5
        lower=3
        url = f'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0/?instrument_id={",".join(instr)}&date_of_interest={date}&list_of_var={",".join(var)}&lower_window={lower}&upper_window={upper}'
        check_envision_output(self, instr, date, var, upper, lower, url)

        url = f'http://team-distribution.info/api/v2/returns?id={",".join(instr)}&date={date}&varlist={",".join(var)}&lower={lower}&upper={upper}'
        #check_distribution_output(self, instr, date, var, upper, lower, url)

        url = f'http://128.199.82.8:8000/api_v2/api?id={",".join(instr)}&date={date}&type={",".join(var)}&upper_window={upper}&lower_window={lower}'
        #check_optiver_output(self, instr, date, var, upper, lower, url)

def check_envision_output(self, instr, date, var, upper, lower, url):
    url = requests.get(url)
    output = url.json()

    self.assertEqual(output['Metadata']['success'], True)

    param = output['Metadata']['parameters']
    self.assertEqual(param['date_of_interest'], date)

    index = 0
    for i in instr:
        self.assertEqual(param['instrument_id'][index], i)
        self.assertEqual(output['Company_Returns'][index]['InstrumentID'], i)
        data = output['Company_Returns'][index]['Data']

        self.assertEqual(len(data), upper+lower+1)
        for j in range(0, len(data)):
            self.assertEqual(data[j]['Date'], '2012-12-{0:02}'.format(j+7)) #start date is 07
            self.assertIsNot(data[j]['Return'], None)
        index += 1

    index = 0
    for v in var:
        self.assertEqual(param['list_of_var'][index], v)
        index += 1

    self.assertEqual(param['upper_window'], upper)
    self.assertEqual(param['lower_window'], lower)


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
