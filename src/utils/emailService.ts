import { EmailAction } from '@/types/models';
import nodeMailer, { SendMailOptions } from 'nodemailer';
import {
    EMAIL_HOST,
    EMAIL_HOST_PORT,
    EMAIL_PASSWORD,
    EMAIL_USERNAME,
    FRONTEND_URL,
} from './constants';

const transporter = nodeMailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_HOST_PORT,
    secure: true,
    auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
    },
});

const BODY_ATTRIBUTES = `marginheight="0" topmargin="0" marginwidth="0"`;
const BODY_STYLE = `margin: 0px; background-color: #ffffff" leftmargin="0"`;
const MAIN_TABLE_STYLE = `border-radius: 15px; border: 1px solid #e6e6e6; max-width: 750px;text-align: center;-webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);-moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);color: #0859c6; padding: 40px 0px;`;
const BUTTON_STYLE = `background: #ea6407;text-decoration: none !important;font-weight: 500;margin-top: 35px;color: #ffffff;text-transform: uppercase;font-size: 14px;padding: 10px 24px;display: inline-block;border-radius: 50px;`;

export function getGeneralEmailTemplate(title: string, content: string) {
    return /* html */ `<!DOCTYPE html>
            <html lang="en-US">
                <head>
                    <meta content="text/html" charset="ISO-8859-5" http-equiv="Content-Type">
                    <meta name="description" content="${title}">
                    <title>${title}</title>
                    <body ${BODY_ATTRIBUTES} style="${BODY_STYLE}">
                        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#ffffff" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif">
                            <tr>
                                <td style="height: 80px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="text-align: center">
                                    <a href="${FRONTEND_URL}" title="Breadwinner logo" target="_blank">
                                        <img src="cid:logo@breadwinner" title="Breadwinner logo" alt="Breadwinner logo" style="width: 100%; max-width: 450px;">;
                                    </a> 
                                </td>
                            </tr>
                            <tr>
                                <td style="height: 20px">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>
                                    <table width="95%" align="center" cellpadding="0" cellspacing="0" style="${MAIN_TABLE_STYLE}">
                                        <tr>
                                            <td style="padding: 0 35px">
                                                <h1 style="font-weight: 500; margin: 0; font-size: 32px; font-family: 'Rubik', sans-serif">${title}</h1>
                                                <span style="display: inline-block; vertical-align: middle; margin: 29px 0 26px; border-bottom: 1px solid #cecece; width: 100px"></span>
                                                ${content}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="height: 20px">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="text-align: center">
                                    <p style="font-size: 14px; color: rgba(69, 80, 86, 0.7411764705882353); line-height: 18px; margin: 0 0 0">&copy; <strong>Breadwinner</strong></p> 
                                </td>
                            </tr>
                            <tr>
                                <td style="height: 80px">&nbsp;</td>
                            </tr>
                        </table>
                    </body>
                </head>
            </html>`;
}

export function getContentWithMessageAndButton(messageLines: string[], actions: EmailAction[]) {
    return /* html */ `${messageLines
        .map(
            (line) =>
                /* html */ `<p style="font-size: 19px; line-height: 24px; margin: 0">${line}</p>`
        )
        .join('\n')}
        ${actions
            .map(
                (action) =>
                    /* html */ `<a href="${action.url}" style="${BUTTON_STYLE}">${action.text}</a>`
            )
            .join('\n')}
    `;
}

export async function sendMail(mailOptions: Omit<SendMailOptions, 'from'>) {
    await transporter.sendMail({
        ...mailOptions,
        from: EMAIL_USERNAME,
        attachments: [
            ...mailOptions.attachments,
            {
                filename: 'logo',
                path: '/src/assets/logo-transparent-450w.png',
                cid: 'logo@breadwinner',
            },
        ],
    });
}
