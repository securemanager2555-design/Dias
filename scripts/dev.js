const { execFileSync, spawn } = require("node:child_process");

const processes = [
  {
    name: "backend",
    child: spawn("npm --prefix backend run dev", {
      stdio: "inherit",
      shell: true,
    }),
  },
  {
    name: "frontend",
    child: spawn("npm --prefix frontend run dev", {
      stdio: "inherit",
      shell: true,
    }),
  },
];

let shuttingDown = false;

const stopAll = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const { child } of processes) {
    if (child.killed) continue;

    if (process.platform === "win32") {
      try {
        execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
          stdio: "ignore",
        });
      } catch {
        child.kill();
      }
    } else {
      child.kill();
    }
  }

  process.exit(code);
};

for (const { name, child } of processes) {
  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    stopAll(1);
  });

  child.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      stopAll(code || 1);
    }
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
