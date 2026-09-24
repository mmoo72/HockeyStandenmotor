import crypto from 'crypto';

const ts = '1788184054';
const pathStr = '/poules/182651/teams/5812';
const uuid = '43102520-fc6c-4a16-a7ca-cdf5c7a5e752';

function sanitize(p) {
  return p.replace(/[^a-zA-Z0-9\/-]+/g, '');
}

const rev = uuid.split('').reverse().join('');
const s = sanitize(pathStr);
const sig = crypto.createHash('sha1').update(ts + s + rev).digest('hex');
console.log('sanitized:', s);
console.log('signature:', sig);
