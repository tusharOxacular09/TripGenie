import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase(env.mongodbUri, env.mongodbDbName);
    app.listen(env.port);
  } catch (_error) {
    process.exit(1);
  }
};

void startServer();
