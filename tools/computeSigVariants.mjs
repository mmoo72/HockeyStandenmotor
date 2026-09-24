#!/usr/bin/env node
import crypto from 'crypto';

const tsBase = '1788184054';
const uuidBase = '43102520-fc6c-4a16-a7ca-cdf5c7a5e752';
const expected = 'f16a838236e0b605a9130f888f7ec3538ab988cd';

function sanitize(p) {
  return p.replace(/[^a-zA-Z0-9\-/]+/g, '');
}

const variants = [
  '/poules/182651',
  'poules/182651',
  '/poules/182651/',
  '/poules/182651?',
  '/poules/182651?include=matches',
  '/poules/182651#frag',
  '/poules/182651?include=matches&extra=1',
];
const uuidVariants = [
  uuidBase,
  uuidBase.replace(/-/g, ''),
  uuidBase.toLowerCase(),
  uuidBase.toUpperCase(),
];

console.log('expected:', expected);
console.log('----');

for (const p of variants) {
  const s = sanitize(p);
  for (const uuid of uuidVariants) {
    const rev = uuid.split('').reverse().join('');
    // try timestamp offsets -2..+2
    for (let off = -2; off <= 2; off++) {
      const ts = (Number(tsBase) + off).toString();
      const sig = crypto.createHash('sha1').update(ts + s + rev).digest('hex');
      const match = sig === expected ? 'MATCH' : '';
      if (match) {
        console.log('MATCH FOUND:', { variant: p, sanitized: s, uuid, ts, sig });
      }
      console.log(p, '=>', `sanitized="${s}"`, 'uuid=', uuid, 'ts=', ts, 'sig=', sig, match);
    }
  }
}
