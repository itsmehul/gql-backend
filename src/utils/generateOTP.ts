export function generateOTP(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export function generateEmailOTP(): number {
  return Math.floor(Math.random() * 999999999999) + 1000000000;
}
