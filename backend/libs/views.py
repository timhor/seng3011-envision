from flask import Flask, request, jsonify, render_template
from libs import compute

app = Flask('envision-server-api')

@app.route('/')
@app.route('/home')
@app.route('/generator')
def generator():
    return render_template('generator.html', current_page="generator")

@app.route('/documentation')
def documentation():
    return render_template('documentation.html', current_page="documentation")

@app.route('/team')
def team():
    return render_template('team.html', current_page="team")

@app.route('/api/')
def api():
    try:
        instr = request.args['instrument_id']
        date = request.args['date_of_interest']
        vars = request.args['list_of_var']
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

