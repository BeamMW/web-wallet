#!/bin/bash

REGEX="beam-wasm-client\-?([a-z]*)@([0-9]+\.[0-9]+\.[0-9]+)"
OUTPUT=$(npm list | grep beam-wasm-client*)
MANIFEST="src/manifest.json"
REVISION=$(git rev-list HEAD --count)

if [[ $OUTPUT =~ $REGEX ]]; then
	echo -n "${BASH_REMATCH[2]}.$REVISION" > version.gen
	sed "s/%BEAM_VERSION%/${BASH_REMATCH[2]}.$REVISION/" $MANIFEST.in > $MANIFEST.tmp;
fi

NETWORK=${BASH_REMATCH[1]}
case $NETWORK in
	"testnet")
		echo -n "Testnet" > network.gen
	;;
	"")
		echo -n "Mainnet" > network.gen
	;;
	*)
		echo -n "Masternet" > network.gen		
	;;

esac



if [[ $NETWORK != '' ]]; then
	sed "s/%BEAM_NETWORK%/ ($NETWORK)/" $MANIFEST.tmp > $MANIFEST;
fi

rm $MANIFEST.tmp
