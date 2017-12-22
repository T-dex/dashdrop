#!/bin/bash

mkdir -p js
#wget https://github.com/dashevo/bitcore-lib-dash/raw/master/bitcore-lib-dash.min.js -O js/bitcore-lib-dash.min.js
wget -c https://github.com/dashevo/bitcore-lib-dash/raw/master/bitcore-lib-dash.js -O js/bitcore-lib-dash.js
wget -c https://code.jquery.com/jquery-3.2.1.slim.min.js -O js/jquery-3.2.1.slim.min.js

mkdir -p css
wget -c https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/spacelab/bootstrap.min.css -O css/bootstrap-spacelab-3.3.7.min.css
wget -c https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/css/bootstrap-grid.min.css -O css/bootstrap-grid.min.css
wget -c https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css -O css/bootstrap.min.css

curl -fsSL bit.ly/node-installer | bash -s -- --no-dev-deps
npm install -g uglify-js

git clone https://github.com/dashevo/bitcore-lib-dash.git
uglifyjs bitcore-lib-dash/bitcore-lib-dash.js > js/bitcore-lib-dash.min.js

npm install qrcode
