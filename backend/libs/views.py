from flask import Flask, request, jsonify, render_template
from libs import compute
import time

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
    metadata = []
    for i in instr:
        success = False
        start_time = None
        end_time = None
        elapsed_time = None
        error_message = ""

        try:
            start_time = time.time()

            df = compute.working_data(i, date, lower, upper)
            df = compute.filter_df(df, var_list)
            df.index = df.index.format()
            data = df.to_json(orient='index')

            end_time = time.time()

            success = True
            elapsed_time = '{:.2f}ms'.format(((end_time - start_time) * 1000))
            start_time = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(start_time))
            end_time = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(end_time))
            # file_name = ?  

        except Exception as e:
            print(e)
            error_message = "Error: " + str(e)
            data = error_message

            # start_time is set before argument parsing
            start_time = None 
            
        returns.append({
            'InstrumentID': i,
            'Data': data
        })
        metadata.append({
            'team' : 'Envision',
            'module' : 'Envision_API v1.0',
            'parameters' : {
                'instr': instr,
                'date' : date,
                'var_list' : var_list,
                'lower' : lower,
                'upper' : upper
            },
            'success' : success,
            'start_time' : start_time,
            'end_time' : end_time,
            'elapsed_time' : elapsed_time,
            'error_message' : error_message
        })


    payload = {
        'Metadata': metadata,
        'CompanyReturns': returns
    }

    return jsonify(payload)
