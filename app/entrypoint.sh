#!/usr/bin/env sh

yarn && yarn build
mkdir dist
mv ./build/* dist