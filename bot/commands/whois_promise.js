'use strict';

var http = require('http');

module.exports = function(ev, alias) { 
    return new Promise(function(resolve, reject) {
        http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + alias, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() { 
                if (res.statusCode != 200) { 
                    reject('This alias hasn\'t been reclaimed yet! **Oink!** :pig:');
                } else {
                    try { 
                        var json = JSON.parse(body);
                        resolve(json.username)
                    } catch (err) {
                        console.error(err);
                        reject('Couldn\'t fetch alias. :( **Oink!** :pig:');
                    }
                }
            });
        })
        .on('error', function(err) {
            console.error(err);
            reject('Couldn\'t fetch alias. :( **Oink!** :pig:');
        }); 
    });
};
