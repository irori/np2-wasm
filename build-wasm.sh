#!/bin/bash

set -e

if [ ! -f "out/build.ninja" ]; then
  emcmake cmake -GNinja -DCMAKE_BUILD_TYPE=MinSizeRel -S src -B out
fi

ninja -C out
mkdir -p dist
cp out/np2* dist/
