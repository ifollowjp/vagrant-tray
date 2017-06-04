#!/bin/sh

declare -r HERE="$( cd "$( dirname "$0" )" ; pwd )"
declare -r APP="$HERE/src"

electron "$APP" 1> /dev/null 2>&1 &

