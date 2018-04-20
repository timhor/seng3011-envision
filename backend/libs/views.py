from flask import Flask, request, jsonify, render_template
from libs import v1_0
from datetime import datetime, timedelta
from markdown2 import markdown
import logging
import warnings
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from db_manage import Dump
import json
with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    engine = create_engine(os.environ['DB_CONN'])
Session = sessionmaker(bind=engine)
session = Session()

app = Flask('envision-server-api')
app.debug = True

VALID_VERSIONS = {
    'v1.0': v1_0,  # Latest is the last one in the dict
    'v1.0.1': v1_0,
    'v1.0.2' : v1_0,
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
    return render_template('generator.html', current_page="generator", variables_list=latest.VALID_VARS, api_version=list(VALID_VERSIONS.keys())[-1])


@app.route('/documentation')
def documentation():
    latest_ver = list(VALID_VERSIONS.keys())[-1]
    return render_template('documentation.html', current_page="documentation", version_number=latest_ver)


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

@app.route('/blog')
def blog():
    return render_template('blog.html', current_page="blog")

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
    if version not in VALID_VERSIONS:
        return f'Unknown API version: {version}'

    compute_engine = VALID_VERSIONS[version]
    start_time = datetime.now()
    success = True
    metadata = {
        'team': 'Envision',
        'module': f'Envision_API {version}',
    }

    # Check that the arguments are correct
    try:
        instr, date, var_list, lower, upper = compute_engine.parse_args(**request.args)
    except compute_engine.ParamException as e:
        metadata['error_messages'] = f"Error: {e}"
        success = False
    except TypeError:
        # Not enough arguments to call parse_args
        metadata['error_messages'] = "Not all required arguments supplied"
        success = False

    if not success:
        metadata['success'] = False
        logger.info(f'{metadata}')
        return jsonify({'Metadata': metadata})

    query_args = {
        'instr': request.args['instrument_id'],
        'date': request.args['date_of_interest'],
        'vars': request.args['list_of_var'],
        'lower': request.args['lower_window'],
        'upper':request.args['upper_window'],
    }
    q = session.query(Dump).filter_by(**query_args)
    query_load = session.execute(q).first()
    if query_load:
        returns = json.loads(query_load[-2])
        if len(query_load[-1]) > 0:
            error_messages = query_load[-1].split('|')
        else:
            error_messages = []
    else:
        returns, error_messages = compute_engine.calculate_returns(instr, date, var_list, lower, upper)
        db_item = Dump(
            **query_args,
            created=datetime.now(),
            payload=json.dumps(returns),
            errors='|'.join(error_messages))
        session.add(db_item)
        session.commit()

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

    metadata['start_time'] = start_time
    metadata['end_time'] = end_time
    metadata['elapsed_time'] = elapsed_time

    if error_messages:
        metadata['error_messages'] = error_messages
        metadata['success'] = False
    else:
        metadata['success'] = True

    logger.info(f'{metadata}')
    payload = {
        'Metadata': metadata,
        'Company_Returns': returns
    }

    return jsonify(payload)
