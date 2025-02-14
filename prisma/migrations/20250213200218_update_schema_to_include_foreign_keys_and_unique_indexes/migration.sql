-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userVerses" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "startingVerse" INTEGER NOT NULL,
    "endingVerse" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userVerses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userVerseReviews" (
    "id" SERIAL NOT NULL,
    "userVerseId" INTEGER NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "detailedResults" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userVerseReviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userCollections" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userCollections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collectionVerses" (
    "id" SERIAL NOT NULL,
    "collectionId" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collectionVerses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_providerAccountId_key" ON "accounts"("providerId", "providerAccountId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVerses" ADD CONSTRAINT "userVerses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collectionVerses" ADD CONSTRAINT "collectionVerses_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
