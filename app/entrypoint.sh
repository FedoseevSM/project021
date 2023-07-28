#!/usr/bin/env sh

yarn && yarn build
mkdir ../build
mv ./build/* ../build