/**
 * Script to download face-api.js model files to public/models/
 * Run: node scripts/download-face-models.mjs
 */
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const MODELS_DIR = join(process.cwd(), "public", "models");

// The weight manifests reference .bin files, not shard files
const FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model.bin",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model.bin",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model.bin",
];

const MIRRORS = [
  "https://cdn.jsdelivr.net/gh/nicehash/face-api.js@master/weights",
  "https://cdn.jsdelivr.net/gh/vladmandic/face-api@master/model",
  "https://raw.githubusercontent.com/nicehash/face-api.js/master/weights",
  "https://raw.githubusercontent.com/vladmandic/face-api/master/model",
];

async function tryDownload(file) {
  for (const mirror of MIRRORS) {
    const url = `${mirror}/${file}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer());
      }
    } catch {
      // try next mirror
    }
  }
  return null;
}

async function main() {
  if (!existsSync(MODELS_DIR)) {
    await mkdir(MODELS_DIR, { recursive: true });
    console.log(`Created ${MODELS_DIR}`);
  }

  let failed = 0;
  for (const file of FILES) {
    const dest = join(MODELS_DIR, file);

    if (existsSync(dest)) {
      console.log(`  OK ${file} (already exists)`);
      continue;
    }

    process.stdout.write(`  Downloading ${file}...`);
    const buf = await tryDownload(file);
    if (buf) {
      await writeFile(dest, buf);
      console.log(` OK (${(buf.length / 1024).toFixed(1)} KB)`);
    } else {
      console.log(` FAILED`);
      failed++;
    }
  }

  if (failed > 0) {
    console.log(`\n${failed} file(s) failed. Manually download from:`);
    console.log("  https://github.com/nicehash/face-api.js/tree/master/weights");
    console.log(`  Place them in: ${MODELS_DIR}`);
  } else {
    console.log("\nAll models downloaded to public/models/");
  }
}

main();
