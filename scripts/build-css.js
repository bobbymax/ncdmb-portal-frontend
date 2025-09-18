#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("🚀 Building optimized CSS...");

// Source and destination paths
const sourceFile = "src/resources/assets/css/styles.css";
const minifiedFile = "src/resources/assets/css/styles.min.css";
const backupFile = "src/resources/assets/css/styles.backup.css";

const threadsSourceFile = "src/resources/assets/css/threads.css";
const threadsMinifiedFile = "src/resources/assets/css/threads.min.css";
const threadsBackupFile = "src/resources/assets/css/threads.backup.css";

try {
  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  // Get original file size
  const originalStats = fs.statSync(sourceFile);
  const originalSizeKB = Math.round(originalStats.size / 1024);

  console.log(`📊 Original file size: ${originalSizeKB}KB`);

  // Create backup
  console.log("💾 Creating backup...");
  fs.copyFileSync(sourceFile, backupFile);

  // Minify CSS
  console.log("⚡ Minifying CSS...");
  execSync(`npx cssnano ${sourceFile} ${minifiedFile}`, { stdio: "inherit" });

  // Get minified file size
  const minifiedStats = fs.statSync(minifiedFile);
  const minifiedSizeKB = Math.round(minifiedStats.size / 1024);
  const reductionPercent = Math.round(
    ((originalSizeKB - minifiedSizeKB) / originalSizeKB) * 100
  );

  console.log(`📊 Minified file size: ${minifiedSizeKB}KB`);
  console.log(`🎉 Size reduction: ${reductionPercent}%`);
  console.log(`✅ Minified CSS saved to: ${minifiedFile}`);
  console.log(`💾 Backup saved to: ${backupFile}`);

  // Process threads.css
  if (fs.existsSync(threadsSourceFile)) {
    console.log("\n🎨 Processing threads.css...");

    // Get original threads file size
    const threadsOriginalStats = fs.statSync(threadsSourceFile);
    const threadsOriginalSizeKB = Math.round(threadsOriginalStats.size / 1024);

    console.log(`📊 Original threads file size: ${threadsOriginalSizeKB}KB`);

    // Create backup
    console.log("💾 Creating threads backup...");
    fs.copyFileSync(threadsSourceFile, threadsBackupFile);

    // Minify threads CSS
    console.log("⚡ Minifying threads CSS...");
    execSync(`npx cssnano ${threadsSourceFile} ${threadsMinifiedFile}`, {
      stdio: "inherit",
    });

    // Get minified threads file size
    const threadsMinifiedStats = fs.statSync(threadsMinifiedFile);
    const threadsMinifiedSizeKB = Math.round(threadsMinifiedStats.size / 1024);
    const threadsReductionPercent = Math.round(
      ((threadsOriginalSizeKB - threadsMinifiedSizeKB) /
        threadsOriginalSizeKB) *
        100
    );

    console.log(`📊 Minified threads file size: ${threadsMinifiedSizeKB}KB`);
    console.log(`🎉 Threads size reduction: ${threadsReductionPercent}%`);
    console.log(`✅ Minified threads CSS saved to: ${threadsMinifiedFile}`);
    console.log(`💾 Threads backup saved to: ${threadsBackupFile}`);
  }
} catch (error) {
  console.error("❌ Error building CSS:", error.message);
  process.exit(1);
}
