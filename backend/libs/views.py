from flask import Flask, request, jsonify, render_template
from libs import compute

app = Flask('envision-server-api')

@app.route('/')
@app.route('/home')
@app.route('/generator')
def generator():
    current_page = "generator"
    return render_template('generator.html', currentPage=current_page)

@app.route('/documentation')
def documentation():
    current_page = "documentation"
    return render_template('documentation.html', currentPage=current_page)

@app.route('/team')
def team():
    current_page = "team"
    return render_template('team.html', currentPage=current_page)

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

