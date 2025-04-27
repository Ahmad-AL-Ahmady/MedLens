const fs = require("fs").promises;
const path = require("path");

async function ensureDefaultAvatar() {
  const defaultAvatarPath = path.join(
    __dirname,
    "public",
    "uploads",
    "users",
    "default.jpg"
  );

  try {
    await fs.access(defaultAvatarPath);
    console.log(`✅ Default avatar exists: ${defaultAvatarPath}`);
  } catch (error) {
    console.log(`Default avatar not found, creating one...`);

    // Create a basic placeholder avatar
    // This is a simple transparent 1x1 pixel PNG in base64
    const defaultImageBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const defaultImageBuffer = Buffer.from(defaultImageBase64, "base64");

    try {
      await fs.writeFile(defaultAvatarPath, defaultImageBuffer);
      console.log(`✅ Created default avatar at: ${defaultAvatarPath}`);
    } catch (err) {
      console.error(`❌ Failed to create default avatar: ${err.message}`);
    }
  }
}

async function setupDirectories() {
  // Define directories that need to exist
  const directories = [
    "public/uploads",
    "public/uploads/users",
    "public/uploads/scans",
  ];

  console.log("Setting up upload directories...");

  // Create each directory if it doesn't exist
  for (const dir of directories) {
    const fullPath = path.join(__dirname, dir);
    try {
      await fs.access(fullPath);
      console.log(`✅ Directory already exists: ${fullPath}`);
    } catch (error) {
      try {
        await fs.mkdir(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${fullPath}`);
      } catch (err) {
        console.error(
          `❌ Failed to create directory: ${fullPath}`,
          err.message
        );
      }
    }
  }

  console.log("Directory setup complete!");
}

setupDirectories();
ensureDefaultAvatar();
