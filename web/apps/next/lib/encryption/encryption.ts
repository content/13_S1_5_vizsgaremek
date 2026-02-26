'use server';

import bcrypt from '@node-rs/bcrypt';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.EMAIL_VERIFICATION_SECRET);

const saltRounds = 10;

export const hash = async (password: string): Promise<string> => {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (err) {
        console.log('Hiba történt a jelszó hashelése közben');
        console.log(err);
        throw err;
    }
};

type generateHashOptions = {
    data: string;
    secret: string;
    validForMs: number;
}

export const generateVerificationToken = async (email: string): Promise<string> => {
    const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .setIssuedAt()
        .sign(secret);
    return token;
};

export const verifyEmailToken = async (token: string): Promise<string | null> => {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload.email as string;
    } catch {
        return null;
    }
};

export const verifyTimedHash = async (
    data: string,
    secret: string,
    hash: string,
    expiresAt: number
): Promise<boolean> => {
    if (Date.now() > expiresAt) {
        return false;
    }
    const payload = `${data}:${secret}:${expiresAt}`;
    return await bcrypt.compare(payload, hash);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};