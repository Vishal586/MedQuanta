const crypto = require("crypto");

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

function generateOtp() {
  // 6-digit numeric code, e.g. "042913"
  const code = crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  return { code, codeHash, expiresAt };
}

function hashOtp(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

module.exports = { generateOtp, hashOtp, OTP_TTL_MINUTES };
