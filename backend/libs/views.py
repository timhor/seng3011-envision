from flask import Flask, request

app = Flask('envision-server-api')

@app.route('/')
@app.route('/home')
def home():
    return "Welcome to SENG3031 API!"

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

    return "Coming soon!"

