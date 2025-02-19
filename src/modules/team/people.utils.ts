export const validateEmail = (email: string): boolean => {
  const testEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return testEmailRegex.test(email);
};
