from flask import Flask, request, jsonify, render_template
from libs import compute

app = Flask('envision-server-api')

@app.route('/')
@app.route('/home')
@app.route('/query')
def query():
    currentPage = "query"
    return render_template('query.html', currentPage=currentPage)

@app.route('/documentation')
def documentation():
    currentPage = "documentation"
    return render_template('documentation.html', currentPage=currentPage)

@app.route('/team')
def team():
    currentPage = "team"
    return render_template('team.html', currentPage=currentPage)

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

