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

@app.route('/api')
def api():
    try:
        instr = request.args['instrument_id']
        date = request.args['date_of_interest']
        var_list = request.args['list_of_var']
        lower = int(request.args['lower_window'])
        upper = int(request.args['upper_window'])
    except KeyError:
        return "Incorrect arguments supplied"


    # TODO: Sanitise inputs a little better
    try:
        var_list = var_list.split(',')
    except ValueError:
        var_list = [var_list]

    try:
        instr = instr.split(',')
    except ValueError:
        instr = [instr]


    returns = []
    for i in instr:
        try:
            df = compute.working_data(i, date, lower, upper)
            df = compute.filter_df(df, var_list)
            df.index = df.index.format()
            data = df.to_json(orient='index')
        except Exception as e:
            print(e)
            data = "Error: " + str(e)
        returns.append({
            'InstrumentID': i,
            'Data': data
        })


    payload = {
        'Metadata': None,  # TODO: Add in meta data
        'CompanyReturns': returns
    }

    return jsonify(payload)
