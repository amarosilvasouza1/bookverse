/* eslint-disable @typescript-eslint/no-require-imports */
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

const fs = require('fs');
const content = `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=mailto:admin@example.com`;

fs.writeFileSync('vapid_keys.txt', content);
console.log('Keys written to vapid_keys.txt');
