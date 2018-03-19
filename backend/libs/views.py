from flask import Flask, request, jsonify, render_template
from libs import compute
from datetime import datetime, timedelta

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
    start_time = datetime.now()
    success = True
    all_error_messages = []

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
            data_frame = compute.working_data(i, date, lower, upper)
            data_frame = compute.filter_data_frame(data_frame, var_list)
            data_frame.index = data_frame.index.format()
            data = data_frame.to_json(orient='index')
            # file_name = ?

        except Exception as e:
            print(e)
            error_message = "Error: " + str(e)
            data = error_message
            all_error_messages.append(error_message)
            success = False

        returns.append({
            'InstrumentID': i,
            'Data': data
        })

    end_time = datetime.now()

    elapsed_time = '{:.2f}ms'.format((end_time - start_time) / timedelta(milliseconds=1))
    start_time = start_time.strftime('%Y-%m-%d %H:%M:%S')
    end_time = end_time.strftime('%Y-%m-%d %H:%M:%S')

    metadata = {
        'team': 'Envision',
        'module': 'Envision_API v1.0',
        'parameters': {
            'instr': instr,
            'date': date,
            'var_list': var_list,
            'lower': lower,
            'upper': upper
        },
        'success': success,
        'start_time': start_time,
        'end_time': end_time,
        'elapsed_time': elapsed_time,
        'error_messages': all_error_messages
    }

    payload = {
        'Metadata': metadata,
        'CompanyReturns': returns
    }

    return jsonify(payload)
