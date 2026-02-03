export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 8;
}

export function validateUsername(username) {
  return username && username.length >= 3 && username.length <= 20;
}

export function sanitizeUser(user) {
  const { password_hash, two_factor_secret, ...safe } = user;
  return safe;
}