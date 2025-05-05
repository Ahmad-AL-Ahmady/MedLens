const { spawn } = require("child_process");
const path = require("path");
const net = require("net");

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net
      .createServer()
      .once("error", () => resolve(true))
      .once("listening", () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

// Function to start the Python AI service
function startPythonService() {
  console.log("Starting Python AI Service...");
  const pythonProcess = spawn("python", ["fast_api\\main.py"], {
    cwd: __dirname,
    stdio: "inherit",
  });

  pythonProcess.on("error", (err) => {
    console.error("Failed to start Python service:", err);
  });

  return pythonProcess;
}

// Function to start the Node.js backend
async function startNodeService() {
  const port = 4000;
  const portInUse = await isPortInUse(port);

  if (portInUse) {
    console.error(
      `Port ${port} is already in use. Please check if another instance is running.`
    );
    process.exit(1);
  }

  console.log("Starting Node.js Backend...");
  const nodeProcess = spawn("node", ["server.js"], {
    cwd: __dirname,
    stdio: "inherit",
  });

  nodeProcess.on("error", (err) => {
    console.error("Failed to start Node.js service:", err);
  });

  return nodeProcess;
}

// Main function to start services
async function startServices() {
  try {
    const nodeProcess = await startNodeService();
    const pythonProcess = startPythonService();

    // Handle process termination
    process.on("SIGINT", () => {
      console.log("Shutting down services...");
      pythonProcess.kill();
      nodeProcess.kill();
      process.exit();
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      pythonProcess.kill();
      nodeProcess.kill();
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start services:", error);
    process.exit(1);
  }
}

// Start the services
startServices();
