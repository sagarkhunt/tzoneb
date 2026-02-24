export function getExistingAdminEmailHtml(params: {
  organizationName: string;
  adminEmail: string;
  loginUrl?: string;
}): string {
  const { organizationName, adminEmail, loginUrl } = params;
  const loginLink = loginUrl || 'https://app.tzone.com/login';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Access – ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1f2937;">TZone Travel</h1>
              <p style="margin: 0 0 24px; font-size: 16px; color: #374151; line-height: 1.6;">
                You have been assigned as <strong>Administrator</strong> for <strong>${organizationName}</strong>.
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Sign in with your existing credentials (${adminEmail}) to access the admin panel.
              </p>
              <a href="${loginLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; background: linear-gradient(to right, #4f80c3, #1f2f58); border-radius: 6px; text-decoration: none;">Sign In</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

export function getAdminCredentialsEmailHtml(params: {
  organizationName: string;
  adminEmail: string;
  password: string;
  loginUrl?: string;
}): string {
  const { organizationName, adminEmail, password, loginUrl } = params;
  const loginLink = loginUrl || 'https://app.tzone.com/login';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your TZone Travel Admin Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                TZone Travel
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">
                Your organization admin account has been created
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #374151; line-height: 1.6;">
                Hello,
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #374151; line-height: 1.6;">
                You have been set up as the <strong>Administrator</strong> for <strong>${organizationName}</strong> on TZone Travel.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your Login Credentials
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 15px; color: #374151;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                        <td style="padding: 8px 0; font-weight: 600;">${adminEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Password:</td>
                        <td style="padding: 8px 0; font-weight: 600; font-family: monospace;">${password}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Role:</td>
                        <td style="padding: 8px 0; font-weight: 600;">Admin</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                For security, we recommend changing your password after your first login.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(to right, #4f80c3, #1f2f58);">
                    <a href="${loginLink}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Sign In to TZone Travel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated message from TZone Travel. Please do not reply to this email.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} TZone Travel. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}
