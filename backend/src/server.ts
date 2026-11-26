import { bootstrapAdminAccount } from "./adminBootstrap.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);

async function startServer(): Promise<void> {
  await bootstrapAdminAccount();
  const app = createApp();

  app.listen(port, () => {
    console.log(`Backend API running on http://localhost:${port}`);
  });
}

void startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error.";
  console.error(`Backend startup failed: ${message}`);
  process.exitCode = 1;
});
