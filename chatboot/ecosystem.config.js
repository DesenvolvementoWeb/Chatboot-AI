module.exports = {
    apps: [
      {
        name: "chatboot",
        script: "./chatboot.js",
        watch: false,
        interpreter: "node",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  