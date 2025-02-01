export const validateFile = (file: File) => {
  const MAX_SIZE = 1024 * 1024; // 1MB
  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 1MB limit');
  }
  return true;
};