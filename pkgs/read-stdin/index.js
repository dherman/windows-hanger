#!/usr/bin/env node

const path = require('path');
const readline = require('readline');

function processEvent(event) {
  const index = event.target.crate_types.indexOf('cdylib');
  if (index < 0) {
    console.error(`no library artifact found for 'neon-prebuild-example'`);
    process.exit(1);
  }

  const abs = event.filenames[index];

  console.error(`manifest_path=${event.manifest_path}`);
  console.error(`dirname(manifest_path)=${path.dirname(event.manifest_path)}`);
  console.error(`abs=${abs}`);
}

function parseLine(line) {
  try {
    const data = JSON.parse(line.trim());
    if ((typeof data === 'object') && ('reason' in data)) {
      return data;
    }
  } catch (ignore) { }
  return null;
}

async function go() {
  try {
    console.error("starting up read-stdin");
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    const rl = readline.createInterface({
      input: process.stdin,
      terminal: false
    });
    for await (const line of rl) {
      console.error("reading a line");
      const event = parseLine(line);
      console.error("read a line");
      if (event && (event.reason === 'compiler-artifact') && (event.target.name === 'neon-prebuild-example')) {
        console.error("found the right event, processing");
        processEvent(event);
        console.error("processed event, closing stdin stream");
        break;
      }
    }
    setTimeout(() => {
      rl.terminal = false;
      rl.close();
      console.error("exiting");
      process.stdin.unref();
      process.exit(0);
    }, 0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

go();
