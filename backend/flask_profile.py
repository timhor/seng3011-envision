from werkzeug.contrib.profiler import ProfilerMiddleware
from application import application  # This is your Flask app
application.wsgi_app = ProfilerMiddleware(application.wsgi_app)
application.run(debug=True)    # Standard run call