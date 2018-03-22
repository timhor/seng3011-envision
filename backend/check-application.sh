#!/bin/sh

# run the application in the background to allow further commands to be executed
pipenv run python application.py &
appPID=$!

# wait for the application to start up
# if an error occurs during this time, it will be printed to the terminal
sleep 3

numMatchingProcesses=$(ps -p $appPID | wc -l)

# test if numMatchingProcesses > 1 because the first line is the column headings
if [ $numMatchingProcesses -gt 1 ]
then
    # kill all processes containing 'backend' in the name
    # when running locally, two such processes existed
    # hence pkill is used instead of kill $appPID
    pkill -f backend 
    return 0
else
    # fail the build - if an error occurs, the process will be killed automatically
    return 1
fi
