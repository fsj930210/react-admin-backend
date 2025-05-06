export const generateRedisKey = (prefix: string, key: string | number) => {
  return `${prefix}:${key}`;
};

export const getErrorMessage = (message: string) => {
  return message.split(':')[1];
};
