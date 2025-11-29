import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, customerName, phone, address, totalAmount, items } = body;

        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = parseInt(process.env.SMTP_PORT || '465');
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const ownerEmail = process.env.OWNER_EMAIL;

        if (!smtpHost || !smtpUser || !smtpPass || !ownerEmail) {
            console.error('Missing SMTP configuration');
            return NextResponse.json({ status: 'error', message: 'Server configuration error' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const mailOptions = {
            from: `"My Shop Store" <${smtpUser}>`,
            to: ownerEmail,
            subject: `New Order #${orderId.slice(0, 8)} - ৳${totalAmount}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">New Order Received!</h2>
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    
                    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Customer Details</h3>
                        <p><strong>Name:</strong> ${customerName}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Address:</strong> ${address}</p>
                    </div>

                    <h3>Order Items</h3>
                    <ul style="list-style-type: none; padding: 0;">
                        ${items.map((item: any) => `
                            <li style="border-bottom: 1px solid #E5E7EB; padding: 10px 0;">
                                <strong>${item.name}</strong> - ৳${item.price}
                            </li>
                        `).join('')}
                    </ul>

                    <h3 style="text-align: right; color: #4F46E5;">Total: ৳${totalAmount}</h3>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email notification sent to:', ownerEmail);

        return NextResponse.json({ status: 'success', message: 'Email sent' });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ status: 'error', message: 'Failed to send email' }, { status: 500 });
    }
}
