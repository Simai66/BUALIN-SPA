export type LogLevel = 'info' | 'warn' | 'error';

export const logEvent = (level: LogLevel, message: string, meta?: Record<string, any>) => {
  const ts = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : '';
  const line = `[${ts}] [${level.toUpperCase()}] ${message}${payload}`;
  // For now, log to console; can later pipe to file or external sink
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};