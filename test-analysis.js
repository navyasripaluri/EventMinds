const fs = require('fs');
const http = require('http');
const path = require('path');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const filePath = path.join(__dirname, 'server', 'sample_contract.txt');
const content = fs.readFileSync(filePath);

const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="contract"; filename="sample_contract.txt"\r\n`),
    Buffer.from(`Content-Type: text/plain\r\n\r\n`),
    content,
    Buffer.from(`\r\n--${boundary}--\r\n`)
]);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/contracts/analyze',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', data);
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
});

req.write(body);
req.end();
