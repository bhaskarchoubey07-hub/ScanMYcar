const { pool, isUsingFileStore } = require('../config/storage');
const { readStore, withStore } = require('../config/fileStore');

const logAuthEvent = async ({ userId, eventType, ipAddress, userAgent, deviceInfo, status }) => {
  if (isUsingFileStore()) {
    return withStore(async (data) => {
      data.authLogs = data.authLogs || [];
      data.authLogs.push({
        id: data.nextIds.authLogs++,
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: deviceInfo,
        status,
        created_at: new Date().toISOString()
      });
    });
  }

  await pool.query(
    `INSERT INTO auth_logs (user_id, event_type, ip_address, user_agent, device_info, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, eventType, ipAddress, userAgent, deviceInfo, status]
  );
};

const createOtp = async ({ mobile, code, purpose = 'auth', expiryMinutes = 10 }) => {
  const expiresAt = new Date(Date.now() + expiryMinutes * 60000).toISOString();

  if (isUsingFileStore()) {
    return withStore(async (data) => {
      data.otpCodes = data.otpCodes || [];
      data.otpCodes.push({
        id: data.nextIds.otpCodes++,
        mobile,
        code,
        purpose,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });
    });
  }

  await pool.query(
    `INSERT INTO otp_codes (mobile, code, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [mobile, code, purpose, expiresAt]
  );
};

const verifyOtp = async (mobile, code, purpose = 'auth') => {
  if (isUsingFileStore()) {
    return withStore(async (data) => {
      data.otpCodes = data.otpCodes || [];
      const index = data.otpCodes.findIndex(
        (o) => o.mobile === mobile && o.code === code && o.purpose === purpose && new Date(o.expires_at) > new Date()
      );
      if (index !== -1) {
        data.otpCodes[index].verified_at = new Date().toISOString();
        return true;
      }
      return false;
    });
  }

  const result = await pool.query(
    `UPDATE otp_codes 
     SET verified_at = CURRENT_TIMESTAMP 
     WHERE mobile = $1 AND code = $2 AND purpose = $3 AND expires_at > CURRENT_TIMESTAMP AND verified_at IS NULL
     RETURNING id`,
    [mobile, code, purpose]
  );

  return result.rowCount > 0;
};

module.exports = {
  logAuthEvent,
  createOtp,
  verifyOtp
};
