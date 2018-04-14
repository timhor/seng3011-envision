from flask import Flask, request, jsonify, render_template
from libs import v1_0
from datetime import datetime, timedelta
from markdown2 import markdown
import logging

app = Flask('envision-server-api')
app.debug = True


VALID_VERSIONS = {
    'v1.0': v1_0,  # Latest is the last one in the dict
}


# Logging information
logger = logging.getLogger('logger')
logger.setLevel(logging.INFO)
fh = logging.FileHandler('logging.log')
fh.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(message)s')
fh.setFormatter(formatter)
logger.addHandler(fh)
logger.info('Logger initialised')


@app.route('/')
@app.route('/home')
@app.route('/generator')
def generator():
    latest = list(VALID_VERSIONS.values())[-1]
    return render_template('generator.html', current_page="generator", variables_list=latest.VALID_VARS)


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
    readme = markdown(readme)
    return render_template('gettingstarted.html', current_page="gettingstarted", readme=readme)

@app.route('/team')
def team():
    return render_template('team.html', current_page="team")


@app.route('/versions')
def versions():
    return render_template('versions.html', current_page="versions")



@app.route('/logs')
def logs():
    with open('logging.log') as file:
        info = file.read()
    info = info.replace('\n', '<br>')
    if request.args.get('raw'):
        return info
    return render_template('logs.html', current_page="logs", logs=info)


@app.route('/api/<version>/')
def api(version):
    if version in VALID_VERSIONS.keys():
        compute_engine = VALID_VERSIONS[version]
        start_time = datetime.now()
        success = True
        all_error_messages = []
        consists_success = False
        metadata = {
            'team': 'Envision',
            'module': f'Envision_API {version}',
            'success': success,
            'error_messages': all_error_messages
        }

        try:
            instr, date, var_list, lower, upper = compute_engine.parse_args(**request.args)
        except compute_engine.ParamException as e:
            all_error_messages.append(f"Error: {e}")
            success = False
        except TypeError:
            all_error_messages.append("Not all required arguments supplied")
            success = False

        if not success:
            logger.info(f'{metadata}')
            return jsonify({'metdata': metadata})

        returns = []
        for i in instr:
            try:
                df = compute_engine.generate_table(i, date, lower, upper, var_list)

                df.index = df.index.format()

                # Alternative implementation
                def listed_dict(df):
                    info_list = []
                    for i in df.iterrows():
                        info = {'Date': i[0]}
                        info.update(i[1].to_dict())
                        info_list.append(info)
                    return info_list

                data = listed_dict(df)

                consists_success = True

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

        metadata['parameters'] =  {
            'instrument_id': instr,
            'date_of_interest': request.args['date_of_interest'],
            'list_of_var': var_list,
            'lower_window': lower,
            'upper_window': upper,
        }

        if consists_success:
            metadata['start_time'] = start_time
            metadata['end_time'] = end_time
            metadata['elapsed_time'] = elapsed_time
        elif not success:
            metadata['error_messages'] = all_error_messages

        logger.info(f'{metadata}')
        payload = {
            'Metadata': metadata,
            'Company_Returns': returns
        }

        return jsonify(payload)
    else:
        return f'Unknown version: {version}'
