#!/usr/bin/env sh

yarn && yarn build
ls
rm -rf /build/*
mv ./build/* /build