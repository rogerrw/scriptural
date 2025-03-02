import { getVerificationRequestByIdentifier } from '@/data/verificationRequests';
import { v4 as uuid } from 'uuid';
import prisma from '@/prisma';

export const generateVerificationToken = async (email: string) => {
  const token = uuid();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // expire the token after 1 hour

  const existingToken = await getVerificationRequestByIdentifier(email);

  if (existingToken) {
    await prisma.verificationRequest.delete({
      where: { id: existingToken.id },
    });
  }

  const verificationRequest = prisma.verificationRequest.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationRequest;
};
