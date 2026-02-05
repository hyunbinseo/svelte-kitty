// See https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
	/** @type {import('pm2-ecosystem').StartOptions[]} */
	apps: [
		{
			name: 'db:scheduled',
			script: './db/scheduled.ts',
			interpreter: 'node',
			time: true, // auto prefix logs with date
			autorestart: false,
			cron: '0 0 * * *',
		},
		{
			name: 'server',
			script: './build/start.js',
			interpreter: 'node',
			instances: -1,
			exec_mode: 'cluster',
			time: true, // auto prefix logs with date
			autorestart: true,
		},
	],
};
