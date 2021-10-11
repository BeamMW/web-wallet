#!/bin/bash

REGEX="beam-wasm-client\-?([a-z]*)@([0-9]+\.[0-9]+\.[0-9]+)"
OUTPUT=$(npm list | grep beam-wasm-client*)
MANIFEST="src/manifest.json"
REVISION=$(git rev-list HEAD --count)

if [[ $OUTPUT =~ $REGEX ]]; then
	sed "s/%BEAM_VERSION%/${BASH_REMATCH[2]}.$REVISION/" $MANIFEST.in > $MANIFEST.tmp;
fi

NETWORK=${BASH_REMATCH[1]}

if [[ $NETWORK != '' ]]; then
	sed "s/%BEAM_NETWORK%/ ($NETWORK)/" $MANIFEST.tmp > $MANIFEST;
fi

rm $MANIFEST.tmp