// Create this file at scripts/bulk-compress.js

const fs = require("fs").promises;
const path = require("path");
const { compressImage } = require("../utils/imageProcessor");

// Configuration
const AVATAR_DIR = path.join(__dirname, "..", "public", "uploads", "users");
const SCAN_DIR = path.join(__dirname, "..", "public", "uploads", "scans");

// Avatar compression settings
const AVATAR_OPTIONS = {
  quality: 80,
  width: 400,
  height: 400,
  maintainAspectRatio: true,
  format: "jpeg",
};

// Medical scan compression settings
const SCAN_OPTIONS = {
  quality: 90,
  width: 1200,
  maintainAspectRatio: true,
};

// Process all images in a directory
async function processDirectory(
  directory,
  options,
  fileTypes = [".jpg", ".jpeg", ".png", ".gif"]
) {
  try {
    console.log(`Processing directory: ${directory}`);

    // List all files
    const files = await fs.readdir(directory);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    // Get original size total
    let originalSize = 0;
    for (const file of files) {
      // Skip default.jpg and non-image files
      if (file === "default.jpg") {
        console.log(`Skipping default avatar: ${file}`);
        skipped++;
        continue;
      }

      // Skip non-image files
      const ext = path.extname(file).toLowerCase();
      if (!fileTypes.includes(ext)) continue;

      const filePath = path.join(directory, file);
      try {
        const stats = await fs.stat(filePath);
        originalSize += stats.size;
      } catch (err) {
        console.error(`Error reading file size for ${file}:`, err.message);
      }
    }

    console.log(
      `Found ${files.length} files (${(originalSize / 1024 / 1024).toFixed(
        2
      )} MB total)`
    );

    // Process each file
    for (const file of files) {
      // Skip default.jpg
      if (file === "default.jpg") {
        console.log(`Skipping default avatar: ${file}`);
        skipped++;
        continue;
      }

      // Skip non-image files
      const ext = path.extname(file).toLowerCase();
      if (!fileTypes.includes(ext)) {
        skipped++;
        continue;
      }

      const filePath = path.join(directory, file);
      try {
        // Get original size
        const originalStats = await fs.stat(filePath);
        const originalSize = originalStats.size;

        // Process image
        console.log(`Processing: ${file}`);
        const outputPath = await compressImage(filePath, options);

        // Check if the file was successfully processed
        if (
          await fs
            .access(outputPath)
            .then(() => true)
            .catch(() => false)
        ) {
          // Get new size
          const newStats = await fs.stat(outputPath);
          const savedPercentage = (
            (1 - newStats.size / originalSize) *
            100
          ).toFixed(2);

          console.log(
            `✅ Compressed ${file}: ${(originalSize / 1024).toFixed(2)} KB → ${(
              newStats.size / 1024
            ).toFixed(2)} KB (${savedPercentage}% saved)`
          );
          processed++;
        } else {
          console.error(
            `❌ Error: Output file not found after compression: ${outputPath}`
          );
          errors++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        errors++;
      }
    }

    console.log(
      `Directory processed: ${processed} files compressed, ${skipped} files skipped, ${errors} errors`
    );

    // Calculate total new size
    let newSize = 0;
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!fileTypes.includes(ext)) continue;

      const filePath = path.join(directory, file);
      try {
        const stats = await fs.stat(filePath);
        newSize += stats.size;
      } catch (err) {
        console.error(`Error reading file size for ${file}:`, err.message);
      }
    }

    const savedTotal = originalSize - newSize;
    const savedPercentage = ((savedTotal / originalSize) * 100).toFixed(2);

    console.log(
      `Total space saved: ${(savedTotal / 1024 / 1024).toFixed(
        2
      )} MB (${savedPercentage}%)`
    );
    console.log(`New total size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);

    return { processed, skipped, errors, originalSize, newSize, savedTotal };
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error.message);
    return {
      processed: 0,
      skipped: 0,
      errors: 1,
      originalSize: 0,
      newSize: 0,
      savedTotal: 0,
    };
  }
}

// Main function
async function bulkCompress() {
  console.log("Starting bulk image compression...");

  // Process avatars
  console.log("\n===== PROCESSING AVATARS =====");
  const avatarResults = await processDirectory(AVATAR_DIR, AVATAR_OPTIONS);

  // Process medical scans
  console.log("\n===== PROCESSING MEDICAL SCANS =====");
  const scanResults = await processDirectory(SCAN_DIR, SCAN_OPTIONS, [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
  ]);

  // Print summary
  console.log("\n===== COMPRESSION SUMMARY =====");
  console.log(
    `Total files processed: ${avatarResults.processed + scanResults.processed}`
  );
  console.log(
    `Total files skipped: ${avatarResults.skipped + scanResults.skipped}`
  );
  console.log(`Total errors: ${avatarResults.errors + scanResults.errors}`);

  const totalOriginal = avatarResults.originalSize + scanResults.originalSize;
  const totalNew = avatarResults.newSize + scanResults.newSize;
  const totalSaved = totalOriginal - totalNew;
  const totalSavedPercentage = ((totalSaved / totalOriginal) * 100).toFixed(2);

  console.log(
    `Total original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(`Total new size: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `Total space saved: ${(totalSaved / 1024 / 1024).toFixed(
      2
    )} MB (${totalSavedPercentage}%)`
  );
}

// Run the script
bulkCompress();
