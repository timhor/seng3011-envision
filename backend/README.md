## Setting Up

### First time setup

```
sudo pip install pipenv
pipenv install --dev
```

Replace `pip` with `pip3` if using python3.

### To run the server

```
source ./envs.sh
pipenv run python application.py
```

### If the pipfile has changed

```
pipenv install --dev
```