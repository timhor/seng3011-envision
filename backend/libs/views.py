from flask import Flask, request, jsonify
from libs import compute

app = Flask('envision-server-api')

@app.route('/')
@app.route('/home')
def home():
    return "Welcome to SENG3011 API! A GUI caller coming soon!"

@app.route('/api/')
def api():
    try:
        instr = request.args['instrumentID']
        date = request.args['DateOfInterest']
        vars = request.args['List_of_Var']
        upper = request.args['upper_window']
        lower = request.args['lower_window']
    except KeyError:
        return "Incorrect arguments supplied"

    # TODO: Currently is only raw data
    return jsonify(compute.get_ts_daily_adjusted(instr).to_json())

