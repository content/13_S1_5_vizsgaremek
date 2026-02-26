"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import React, { JSXElementConstructor } from "react";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +(process.env.EMAIL_PORT ?? 587),
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function renderEmail(component: React.ReactElement<unknown, string | JSXElementConstructor<any>>, options?: Record<string, any>) {
    return await render(component, options);
}

export async function sendEmail(to: string, subject: string, html: string) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to,
            subject,
            html
        });

        return info;
    } catch (error) {        
        console.error("Error sending email:", error);
        throw error;
    }
}