'use strict';

const _ = require('lodash');
const http = require('http');
const redis = require('redis');
const Promise = require('bluebird');
const client = redis.createClient('redis://redis:6379');


const hostname = '0.0.0.0';
const port = 8085;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function checkAnagram (res) {
  for (var i = 0; i < res.length; i++) {
    for (var j = i+1; j < res.length; j++) {
      const a = parseInt(res[i])/parseInt(res[j]);
      const b = parseInt(res[j])/parseInt(res[i]);

      if (a === 177 || b === 177) {
        return true;
      }
      if (res[i].length === res[j].length) {
        const c = res[i].split('').sort().join('');
        const d = res[j].split('').sort().join('');

        if (c === d) {
          return true
        }
      }
    }
  }
  return false;
}


client.multi()
.dbsize()
.keys('*')
.exec((err, replies) => {
  if (err) throw err;
  let checkSum = 0;
  let c = 0;

  function finalResult(result) {
    http.get('http://answer:3000/' + result, res => {
      console.log('Statuscode:', res.statusCode);
    });
  }

  Promise.each(replies[1], function(key, index) {
    client.smembers(key, function(err, res) {
      if (res) {
        if (!checkAnagram(res)) {
          const sub = Math.max(...res) - Math.min(...res);
          checkSum = checkSum + sub;
          if(replies[1].length === index + 1) {
            finalResult(checkSum);
          }
        }
      }
    });
    client.lrange(key, 0, -1, function(err, res) {
      if (res) {
        if (!checkAnagram(res)) {
          const sub = Math.max(...res) - Math.min(...res);
          checkSum = checkSum + sub;
          if(replies[1].length === index + 1) {
            finalResult(checkSum);
          }
        }
      }
    });
  })
  
  console.log('DB has been verified!');
});