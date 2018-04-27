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
