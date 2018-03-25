#!/bin/sh

npm install express errorhandler body-parser cors sqlite3
npm install
node migration.js
