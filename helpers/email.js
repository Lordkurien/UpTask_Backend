import nodemailer from "nodemailer";

export const registeredEmail = async (datos) => {
    const { email, name, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Projects Manager" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Check your account",
        text: "Check your account",
        html: ` <p>Hi! ${name} Check your account on UpTask</p>
        <p>Your account is almost ready, you just have to check it at the following link: </p>

        <a href="${process.env.FRONTEND_URL}/confirm/${token}">Check my account</a>
        
        <p>If you did not created this account, ignore this message</p>
        `
    });
};

export const emailForgetPassword = async (datos) => {
    const { email, name, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Projects Manager" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Change your password",
        text: "Change your password",
        html: ` <p>Hi! ${name} Change your password on UpTask</p>
        <p>In the following link you can change your password: </p>

        <a href="${process.env.FRONTEND_URL}/forget-password/${token}">Change your password</a>
        
        <p>If you did not ask for this email, ignore this message</p>
        `
    });
};

