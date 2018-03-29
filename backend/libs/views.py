from flask import Flask, request, jsonify, render_template
from libs import v1_0
from datetime import datetime, timedelta
from flask_misaka import Misaka

app = Flask('envision-server-api')
app.debug = True

VALID_VARS = {
    'Return': 'Return',
    'Return_pct': 'Return Percentage',
    'CM_Return': 'Cumulative Return',
    'CM_Return_pct': 'Cumulative Return Percentage',
    'AV_Return': 'Average Return',
    'AV_Return_pct': 'Average Return Percentage',
    'Daily_Spread': 'Daily Spread',
    'Volume': 'Volume',
    'Volume_pct': 'Volume Percentage'
}
VALID_VERSIONS = {
    'v1.0': v1_0,
}


Misaka(app)


@app.route('/')
@app.route('/home')
@app.route('/generator')
def generator():
    return render_template('generator.html', current_page="generator", variables_list=VALID_VARS)


@app.route('/documentation')
def documentation():
    return render_template('documentation.html', current_page="documentation")

@app.route('/gettingstarted')
def gettingstarted():
    try:
        with open('README.md', 'r') as f:
            readme = f.read()
    except IOError:
        readme = ""
        print("Could not read file: README.md")
    return render_template('gettingstarted.html', current_page="gettingstarted", readme=readme)

@app.route('/team')
def team():
    return render_template('team.html', current_page="team")


@app.route('/versions')
def versions():
    return render_template('versions.html', current_page="versions")


@app.route('/api/<version>/')
def api(version):
    if version in VALID_VERSIONS.keys():
        compute_engine = VALID_VERSIONS[version]
        start_time = datetime.now()
        success = True
        all_error_messages = []

        try:
            instr = request.args['instrument_id']
            date_string = request.args['date_of_interest']
            var_list = request.args['list_of_var']
            lower = int(request.args['lower_window'])
            upper = int(request.args['upper_window'])
        except KeyError:
            return "Incorrect arguments supplied"

        instr, date, var_list = compute_engine.parse_args(instr, date_string, var_list)

        returns = []
        for i in instr:
            try:
                df = compute_engine.generate_table(i, date, lower, upper, var_list)

                df.index = df.index.format()
                data = df.to_dict(orient='index')

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
            'module': f'Envision_API {version}',
            'parameters': {
                'instrument_id': instr,
                'date_of_interest': date_string,
                'list_of_var': var_list,
                'lower_window': lower,
                'upper_window': upper,
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
    else:
        return f'Unknown version: {version}'
