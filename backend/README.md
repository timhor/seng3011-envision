## Setting Up

### Environment

```
source ./envs.sh
```

This sets the appropriate environment variables to be used by the application.

### pipenv

```
sudo pip install pipenv
```

Replace `pip` with `pip3` if using python3.

### Installing Dependencies

```
pipenv install --dev
```

### Running the API Server

```
pipenv run python application.py
```

### API Endpoint Variables

- `instrument_id`
- `date_of_interest`
- `list_of_var`
- `lower_window`
- `upper_window`
