import bcrypt from '@node-rs/bcrypt';

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

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};