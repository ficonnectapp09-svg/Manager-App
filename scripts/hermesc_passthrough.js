const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
console.log('[hermesc_passthrough] Received args:', args);

let outFile = null;
let inFile = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-out' && i + 1 < args.length) {
    outFile = args[i + 1];
    for (let j = i + 2; j < args.length; j++) {
      if (!args[j].startsWith('-')) {
        inFile = args[j];
        break;
      }
    }
    break;
  }
}

if (!outFile || !inFile) {
  console.error('[hermesc_passthrough] Error: could not identify inFile and outFile from arguments:', args);
  process.exit(1);
}

const resolvedIn = path.resolve(process.cwd(), inFile);
const resolvedOut = path.resolve(process.cwd(), outFile);

console.log(`[hermesc_passthrough] Input bundle: ${resolvedIn}`);
console.log(`[hermesc_passthrough] Output target: ${resolvedOut}`);

if (!fs.existsSync(resolvedIn)) {
  console.error(`[hermesc_passthrough] Error: input bundle does not exist: ${resolvedIn}`);
  process.exit(1);
}

// Ensure parent dir of outFile exists
fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });

// Copy bundle to the expected bytecode file location
fs.copyFileSync(resolvedIn, resolvedOut);
console.log(`[hermesc_passthrough] Successfully copied ${fs.statSync(resolvedIn).size} bytes to ${resolvedOut}`);

// Create dummy source map if requested or if not exists
const mapFile = resolvedOut + '.map';
if (!fs.existsSync(mapFile)) {
  fs.writeFileSync(mapFile, JSON.stringify({ version: 3, sources: [], mappings: "" }), 'utf8');
  console.log(`[hermesc_passthrough] Created dummy sourcemap at ${mapFile}`);
}

process.exit(0);

