module.exports = {
  apps: [
    {
      name: 'veloiq',
      cwd: '/Users/ralphkoh/projects/VeloIQ',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 8082,
        NODE_ENV: 'production'
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
}
