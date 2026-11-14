export type VerificationMessage = {
  to: string;
  from: string;
  subject: string;
  link: string;
};

export const verificationMessages: VerificationMessage[] = [];

export async function sendVerificationEmail(
  message: VerificationMessage,
): Promise<'accepted' | 'rejected'> {
  if (process.env.NODE_ENV !== 'production') {
    verificationMessages.push(message);
    console.log(message.link);
    return 'accepted';
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return 'rejected';
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.link,
      }),
    });
    if (!response.ok) {
      console.error('verification mail rejected', response.status);
      return 'rejected';
    }
    return 'accepted';
  } catch (error) {
    console.error('verification mail failed', error);
    return 'rejected';
  }
}
