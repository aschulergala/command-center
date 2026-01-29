export default () => {
  const port = parseInt(process.env.PORT ?? '3000', 10);
  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }
  return {
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173',
  };
};
