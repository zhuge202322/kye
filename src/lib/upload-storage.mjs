import path from 'node:path';

export function resolveUploadDirectory(configuredDirectory = process.env.UPLOAD_DIRECTORY, workingDirectory = process.cwd()) {
  return configuredDirectory || path.join(workingDirectory, 'public', 'uploads');
}
