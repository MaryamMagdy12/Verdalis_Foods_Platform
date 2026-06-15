#!/usr/bin/env node
/**
 * Optional: Compress hero videos with minimal quality loss.
 * Requires ffmpeg: https://ffmpeg.org/download.html
 *
 * Run: node scripts/compress-videos.mjs
 * Outputs to src/assets/videos/compressed/ (create that folder first)
 *
 * CRF 18 = visually lossless for most content
 */

import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO_DIR = join(__dirname, "../src/assets/videos");
const OUT_DIR = join(VIDEO_DIR, "compressed");

const CRF = 18; // High quality (lower = better, 18–23 is visually lossless)
const PRESET = "slow"; // Better compression, slower encode

async function compress(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      [
        "-i", inputPath,
        "-c:v", "libx264",
        "-crf", String(CRF),
        "-preset", PRESET,
        "-movflags", "+faststart",
        "-an",
        "-y",
        outputPath,
      ],
      { stdio: "inherit" }
    );
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

async function main() {
  if (!existsSync(VIDEO_DIR)) {
    console.log("No videos folder found. Skipping.");
    return;
  }
  const fs = await import("fs/promises");
  const files = await fs.readdir(VIDEO_DIR).catch(() => []);
  const videos = files.filter((f) => /\.(mp4|webm|mov)$/i.test(f));
  if (videos.length === 0) {
    console.log("No video files found.");
    return;
  }
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Compressing ${videos.length} video(s) with CRF=${CRF} (high quality)...`);
  for (const v of videos) {
    const inp = join(VIDEO_DIR, v);
    const ext = v.replace(/\.\w+$/, "") + ".mp4";
    const out = join(OUT_DIR, ext);
    try {
      await compress(inp, out);
      console.log(`Done: ${v} -> compressed/${ext}`);
    } catch (e) {
      console.error(`Failed ${v}:`, e.message);
    }
  }
  console.log("Replace original video paths with compressed/ versions in your components to use them.");
}

main().catch(console.error);
