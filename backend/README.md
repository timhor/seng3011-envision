## Setting Up

### Environment
Get envs.sh from Michael.

```
source ./envs.sh
```

### pipenv
```
sudo pip install pipenv
```

pip3 if using python3

### Installing Dependencies
```
pipenv install --dev
```

### Running the API Server
```
pipenv run python application.py
```

### API Endpoint variables (to be improved)
- instrument_id
- date_of_interest
- list_of_var
- lower_window
- upper_window

### Testing on Jupyter
```
pipenv run jupyter notebook
```
