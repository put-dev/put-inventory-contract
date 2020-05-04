#!/bin/bash
winpty docker run -v /$(pwd)/contracts/$1:/data -it eosio.cdt:1.7.0 \
 bash -c "eosio-cpp -abigen -o //tmp/$2.wasm //data/$2.cpp && mv //tmp/$2.wasm //data/$1.wasm && mv //tmp/$2.abi //data/$1.abi"