export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL || 'support@nimradev.site';

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'RESEND_API_KEY environment variable is not configured in Vercel.' 
      });
    }

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NimraDev Hub <onboarding@resend.dev>',
        to: [toEmail],
        reply_to: email,
        subject: `[NimraDev Contact] ${subject || 'New Message from Hub'}: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-top: 0;">New Message from Nimra's Hub</h2>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            <div style="margin-top: 15px; padding: 15px; background-color: #ffffff; border-left: 4px solid #4f46e5; border-radius: 4px;">
              <p style="white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0 10px;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">Sent via nimradev.site contact portal.</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to send email via Resend' });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Resend API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
