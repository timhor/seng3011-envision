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
pipenv run python run.py
```

### API Endpoint variables (to be improved)
- instrumentID
- DateOfInterest
- List_of_Var
- lower_window
- upper_window

### Testing on Jupyter
```
pipenv run jupyter notebook
```
