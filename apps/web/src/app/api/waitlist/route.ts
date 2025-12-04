import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
        const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

        if (!privateKey || !clientEmail || !spreadsheetId) {
            console.error('Missing Google Sheets credentials');
            // In development, we might want to return a mock success or specific error
            // For now, we'll return a 500 but with a helpful message for the developer
            return NextResponse.json(
                { error: 'Server misconfiguration: Missing Google Sheets credentials' },
                { status: 500 }
            );
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:B', // Assumes Sheet1 exists and we want to append to columns A and B
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [email, new Date().toISOString()], // Save email and timestamp
                ],
            },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error submitting to waitlist:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
