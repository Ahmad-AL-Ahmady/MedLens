const fs = require("fs").promises;
const path = require("path");

async function checkImageProcessing() {
  try {
    console.log("Setting up image processing...");

    // Check if Sharp is installed correctly
    try {
      const sharp = require("sharp");
      const version = sharp.versions.sharp;
      console.log(`✅ Sharp is installed successfully, version: ${version}`);

      // Test if Sharp can process images
      const testBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64"
      );

      await sharp(testBuffer).resize(10, 10).toBuffer();

      console.log("✅ Sharp is functioning correctly");
    } catch (error) {
      console.error("❌ Sharp installation issue:", error.message);
      console.log("Please run: npm rebuild sharp --force");
    }

    // Ensure imageProcessor.js is available
    const processorPath = path.join(
      __dirname,
      "..",
      "utils",
      "imageProcessor.js"
    );
    try {
      await fs.access(processorPath);
      console.log("✅ Image processor utility found");
    } catch (error) {
      console.error("❌ Image processor utility not found:", error.message);
    }

    console.log("Image processing setup complete!");
  } catch (error) {
    console.error("Error during image processing setup:", error.message);
  }
}

checkImageProcessing();
