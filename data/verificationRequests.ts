import prisma from '@/prisma';
export const getVerificationRequestByToken = async (token: string) => {
  try {
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { token },
    });

    return verificationRequest;
  } catch (error) {
    throw error;
  }
};

export const getVerificationRequestByIdentifier = async (identifier: string) => {
  try {
    console.log(prisma);

    const verificationRequest = await prisma.verificationRequest.findFirst({
      where: { identifier },
    });
    return verificationRequest;
  } catch (error) {
    throw error;
  }
};
