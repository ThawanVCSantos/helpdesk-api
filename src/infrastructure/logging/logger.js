function write(level, message, metadata) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(metadata ? { metadata } : {}),
  };
  const output = JSON.stringify(entry);
  if (level === 'error') process.stderr.write(`${output}\n`);
  else process.stdout.write(`${output}\n`);
}

export const logger = {
  info(message, metadata) {
    write('info', message, metadata);
  },
  error(message, metadata) {
    write('error', message, metadata);
  },
};
