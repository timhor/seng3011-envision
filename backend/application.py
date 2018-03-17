from libs.views import app

# To rename the app to be used by AWS
application = app

if __name__ == '__main__':
    application.run(debug=True)
