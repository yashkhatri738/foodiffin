import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRestaurantCredentials({
    restaurantName,
    email,
    password,
}: {
    restaurantName: string;
    email: string;
    password: string;
}) {
    const { error } = await resend.emails.send({
        from: "FoodFinn <noreply@foodfinn.com>",
        to: email,
        subject: `Your FoodFinn Admin Credentials – ${restaurantName}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Admin Credentials</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#ea580c;padding:32px 40px;text-align:center;">
              <span style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;">
                food<span style="color:#fed7aa;">finn</span>
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Welcome to FoodFinn Admin 🎉</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Your restaurant <strong style="color:#111827;">${restaurantName}</strong> has been successfully created. 
                Use the credentials below to access your admin dashboard.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;">Login Credentials</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:13px;color:#9ca3af;display:block;">Email / ID</span>
                          <span style="font-size:15px;font-weight:600;color:#111827;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0 0;">
                          <span style="font-size:13px;color:#9ca3af;display:block;">Password</span>
                          <span style="font-size:15px;font-weight:600;color:#111827;font-family:monospace;background:#f3f4f6;padding:4px 10px;border-radius:6px;">${password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
                Visit the admin login page and use the above credentials to sign in.
              </p>

              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
                For security, please change your password after first login.<br/>
                If you didn't create a restaurant on FoodFinn, please ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 FoodFinn. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    });

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
}
