export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL ?? 'admin@ariesferrus.local',
    adminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'changeme',
  },
  app: {
    url: process.env.APP_URL ?? 'http://localhost:5173',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'chuck.hansen.larp@gmail.com',
    inviteExpiresHours: parseInt(process.env.INVITE_EXPIRES_HOURS ?? '72', 10),
  },
});
