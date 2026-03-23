module.exports = {
  apps: [
    {
      name: "tripgenie-frontend",
      script: "npm",
      args: "run start:frontend",
      env: {
        PORT: 3339
      }
    },
    {
      name: "tripgenie-backend",
      script: "npm",
      args: "run start:backend"
    }
  ]
};
