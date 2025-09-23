#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Building optimized CSS

// Source and destination paths
const sourceFile = "src/resources/assets/css/styles.css";
const minifiedFile = "src/resources/assets/css/styles.min.css";
const backupFile = "src/resources/assets/css/styles.backup.css";

const threadsSourceFile = "src/resources/assets/css/threads.css";
const threadsMinifiedFile = "src/resources/assets/css/threads.min.css";
const threadsBackupFile = "src/resources/assets/css/threads.backup.css";

const flatFolderSourceFile =
  "src/resources/assets/css/flat-folder-redesign.css";
const flatFolderMinifiedFile =
  "src/resources/assets/css/flat-folder-redesign.min.css";
const flatFolderBackupFile =
  "src/resources/assets/css/flat-folder-redesign.backup.css";

try {
  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  // Get original file size
  const originalStats = fs.statSync(sourceFile);
  const originalSizeKB = Math.round(originalStats.size / 1024);

  // Original file size logged

  // Create backup
  // Creating backup
  fs.copyFileSync(sourceFile, backupFile);

  // Minify CSS
  // Minifying CSS
  execSync(`npx cssnano ${sourceFile} ${minifiedFile}`, { stdio: "inherit" });

  // Get minified file size
  const minifiedStats = fs.statSync(minifiedFile);
  const minifiedSizeKB = Math.round(minifiedStats.size / 1024);
  const reductionPercent = Math.round(
    ((originalSizeKB - minifiedSizeKB) / originalSizeKB) * 100
  );

  // Minified file size and reduction logged

  // Process threads.css
  if (fs.existsSync(threadsSourceFile)) {
    // Processing threads.css

    // Get original threads file size
    const threadsOriginalStats = fs.statSync(threadsSourceFile);
    const threadsOriginalSizeKB = Math.round(threadsOriginalStats.size / 1024);

    // Original threads file size logged

    // Create backup
    // Creating threads backup
    fs.copyFileSync(threadsSourceFile, threadsBackupFile);

    // Minify threads CSS
    // Minifying threads CSS
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

    // Minified threads file size and reduction logged
  }

  // Process flat-folder-redesign.css
  if (fs.existsSync(flatFolderSourceFile)) {
    // Processing flat-folder-redesign.css

    // Get original flat folder file size
    const flatFolderOriginalStats = fs.statSync(flatFolderSourceFile);
    const flatFolderOriginalSizeKB = Math.round(
      flatFolderOriginalStats.size / 1024
    );

    // Original flat folder file size logged

    // Create backup
    // Creating flat folder backup
    fs.copyFileSync(flatFolderSourceFile, flatFolderBackupFile);

    // Minify flat folder CSS
    // Minifying flat folder CSS
    execSync(`npx cssnano ${flatFolderSourceFile} ${flatFolderMinifiedFile}`, {
      stdio: "inherit",
    });

    // Get minified flat folder file size
    const flatFolderMinifiedStats = fs.statSync(flatFolderMinifiedFile);
    const flatFolderMinifiedSizeKB = Math.round(
      flatFolderMinifiedStats.size / 1024
    );
    const flatFolderReductionPercent = Math.round(
      ((flatFolderOriginalSizeKB - flatFolderMinifiedSizeKB) /
        flatFolderOriginalSizeKB) *
        100
    );

    // Minified flat folder file size and reduction logged
  }
} catch (error) {
  console.error("❌ Error building CSS:", error.message);
  process.exit(1);
}
