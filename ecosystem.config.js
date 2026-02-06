const path = require("path");

module.exports = {
  apps: [
    {
      name: "pingrelay-web",
      cwd: path.join(__dirname, "web"),
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3601,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
