import { addHours } from 'date-fns';
import { getVerificationRequestByIdentifier } from '@/data/verificationRequests';
import { v4 as uuid } from 'uuid';
import prisma from '@/prisma';

export const generateVerificationToken = async (email: string) => {
  const token = uuid();
  const expires = addHours(new Date(), 1);

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
