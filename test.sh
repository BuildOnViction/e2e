#!/bin/bash

echo "Connections:"
netstat -ant | grep ESTABLISHED | grep 443| wc -l
date +%d-%m-%Y_%H:%M:%S

NODE_ENV=devnet /usr/bin/npm run test test/tomodex.js
RESULT=$?
if [ $RESULT -eq 0 ]; then echo OK; else echo NOK; /usr/bin/node /usr/bin/pm2 restart tomox-sdk; fi
