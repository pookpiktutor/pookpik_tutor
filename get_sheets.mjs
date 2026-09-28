import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const SCRIPT_ID = '1btIyBNvEsl4h7fyRhGkR94NXt2eDJEsL2tuw3CHuuzDDMFQNYiAC6MQZ';
const DEPLOYMENT_ID = 'AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg';

async function run() {
  const token = JSON.parse(readFileSync(join(process.env.USERPROFILE, '.clasprc.json'), 'utf8')).access_token;
  
  const res = await fetch(`https://script.googleapis.com/v1/scripts/${SCRIPT_ID}:run`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      function: 'testMyCode',
      devMode: true
    })
  });
  console.log(await res.json());
}
run();
