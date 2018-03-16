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
        lower = request.args['lower_window']
        upper = request.args['upper_window']
    except KeyError:
        return "Incorrect arguments supplied"


    # TODO: Currently is only raw working data
    try:
        df = compute.working_data(instr, date, lower, upper)
    except Exception as e:
        print(e)
        return "Error."

    return jsonify(df.to_json())

@app.route('/test/')
def test():
    instr = 'ABP.AX'
    date = '10/12/2012'
    lower = 3
    upper = 5

    try:
        df = compute.working_data(instr, date, lower, upper)
    except Exception as e:
        print(e)
        return "Error."

    cm = compute.cm_return(df)
    av = compute.av_return(df)
    print(cm)
    print(av)
    return jsonify(df.to_json())