import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount } = body;

        const apiKey = process.env.STEADFAST_API_KEY;
        const secretKey = process.env.STEADFAST_SECRET_KEY;

        if (!apiKey || !secretKey) {
            console.error('Steadfast credentials missing. API_KEY:', !!apiKey, 'SECRET_KEY:', !!secretKey);
            return NextResponse.json({ status: 'error', message: 'Server configuration error: Missing Credentials' }, { status: 500 });
        }

        console.log('Sending payload to Steadfast:', JSON.stringify({
            invoice, recipient_name, recipient_phone, recipient_address, cod_amount
        }));

        const response = await fetch('https://portal.packzy.com/api/v1/create_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
                'Secret-Key': secretKey,
            },
            body: JSON.stringify({
                invoice,
                recipient_name,
                recipient_phone,
                recipient_address,
                cod_amount,
                note: 'F-commerce Order',
            }),
        });

        const responseText = await response.text();
        console.log('Steadfast Raw Response:', response.status, responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse Steadfast response JSON');
            return NextResponse.json({ status: 'error', message: 'Invalid JSON from Steadfast', raw: responseText }, { status: 502 });
        }

        if (response.ok && data.status === 200) {
            return NextResponse.json({
                status: 'success',
                tracking_id: data.consignment.consignment_id,
                data: data
            });
        } else {
            console.error('Steadfast API Error:', data);
            return NextResponse.json({ status: 'error', message: 'Failed to create shipment', details: data }, { status: 400 });
        }

    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
    }
}
