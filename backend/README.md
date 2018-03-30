## Setting Up

### Initial setup

```
sudo pip install pipenv
pipenv install --dev
```

Replace `pip` with `pip3` if using python3.

### Running the server

```
source ./envs.sh
pipenv run python application.py
```

### Updating dependencies

```
pipenv install --dev
```
