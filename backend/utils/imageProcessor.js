const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

/**
 * Compresses an image file
 * @param {string} inputPath - Path to the original image file
 * @param {Object} options - Compression options
 * @param {number} options.quality - JPEG and WebP compression quality (1-100)
 * @param {number} options.width - Maximum width (optional)
 * @param {number} options.height - Maximum height (optional)
 * @param {boolean} options.maintainAspectRatio - Whether to maintain aspect ratio when resizing
 * @returns {Promise<string>} - Path to the compressed image
 */
exports.compressImage = async (inputPath, options = {}) => {
  try {
    // Skip processing default.jpg
    if (inputPath.endsWith("default.jpg")) {
      console.log(`Skipping default avatar: ${inputPath}`);
      return inputPath;
    }

    // Default options
    const {
      quality = 80,
      width = null,
      height = null,
      maintainAspectRatio = true,
      format = null,
    } = options;

    console.log(`Processing image: ${inputPath}`);

    // Get image info
    const imageInfo = await sharp(inputPath).metadata();
    console.log(
      `Image format: ${imageInfo.format}, Size: ${imageInfo.width}x${imageInfo.height}`
    );

    // Parse file details
    const originalExt = path.extname(inputPath);
    const filename = path.basename(inputPath, originalExt);
    const directory = path.dirname(inputPath);

    // Determine output format (use original if not specified)
    const outputFormat = format || imageInfo.format;
    const outputExt = format ? `.${format}` : originalExt;
    const outputPath = path.join(directory, `${filename}${outputExt}`);

    // Start processing pipeline
    let pipeline = sharp(inputPath);

    // Resize if dimensions are provided
    if (width || height) {
      const resizeOptions = {
        width: width || null,
        height: height || null,
        fit: maintainAspectRatio ? "inside" : "fill",
        withoutEnlargement: true,
      };
      pipeline = pipeline.resize(resizeOptions);
    }

    // Apply format-specific options
    if (outputFormat === "jpeg" || outputFormat === "jpg") {
      pipeline = pipeline.jpeg({ quality });
    } else if (outputFormat === "png") {
      pipeline = pipeline.png({
        quality: Math.max(1, Math.floor(quality / 10)),
      });
    } else if (outputFormat === "webp") {
      pipeline = pipeline.webp({ quality });
    }

    // Always create a temporary file for the compressed version
    const tempOutputPath = `${outputPath}.temp`;

    // Save the compressed image to the temporary file
    await pipeline.toFile(tempOutputPath);

    try {
      // Get file sizes for reporting
      const originalStats = await fs.stat(inputPath);
      const compressedStats = await fs.stat(tempOutputPath);
      const savedPercentage = (
        (1 - compressedStats.size / originalStats.size) *
        100
      ).toFixed(2);

      // Delete the original file
      await fs.unlink(inputPath);
      console.log(
        `Original file deleted: ${inputPath} (${(
          originalStats.size / 1024
        ).toFixed(2)} KB)`
      );

      // Rename the temporary file to the final output path
      await fs.rename(tempOutputPath, outputPath);

      console.log(
        `Compressed image saved: ${outputPath} (${(
          compressedStats.size / 1024
        ).toFixed(2)} KB, ${savedPercentage}% saved)`
      );

      return outputPath;
    } catch (error) {
      console.error(`Error during file replacement: ${error.message}`);

      // If something goes wrong, try to clean up the temp file
      try {
        await fs.unlink(tempOutputPath);
      } catch (cleanupError) {
        console.error(`Error cleaning up temp file: ${cleanupError.message}`);
      }

      // Return the original path since we couldn't complete the operation
      return inputPath;
    }
  } catch (error) {
    console.error("Error compressing image:", error);
    // Return original path if compression fails
    return inputPath;
  }
};

/**
 * Processes an uploaded profile avatar
 * @param {string} filePath - Path to the uploaded avatar
 * @returns {Promise<string>} - Path to the processed avatar
 */
exports.processAvatar = async (filePath) => {
  try {
    // Skip processing default.jpg
    if (filePath.endsWith("default.jpg")) {
      console.log(`Skipping default avatar: ${filePath}`);
      return filePath;
    }

    // Avatar-specific compression options
    const options = {
      quality: 80,
      width: 400, // Standard width for profile avatars
      height: 400, // Standard height for profile avatars
      maintainAspectRatio: true,
      format: "jpeg", // Convert all avatars to JPEG for consistency
    };

    return await exports.compressImage(filePath, options);
  } catch (error) {
    console.error("Error processing avatar:", error);
    return filePath;
  }
};

/**
 * Processes a medical scan image
 * @param {string} filePath - Path to the uploaded scan
 * @returns {Promise<string>} - Path to the processed scan
 */
exports.processMedicalScan = async (filePath) => {
  try {
    // Medical scan-specific compression options
    // Using higher quality because these are medical images
    const options = {
      quality: 90,
      width: 1200, // Higher resolution for medical scans
      maintainAspectRatio: true,
      // Keep original format for medical scans
    };

    return await exports.compressImage(filePath, options);
  } catch (error) {
    console.error("Error processing medical scan:", error);
    return filePath;
  }
};
