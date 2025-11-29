import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Forward the request to n8n
        const response = await fetch('https://n8n.eurekia-solutions.com/webhook/8cd1ec96-b262-4641-a9bf-d8eb3d2643a3', {
            method: 'POST',
            body: formData,
            // Headers are automatically handled by fetch when sending FormData
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: `n8n error: ${response.status}`, details: errorText }, { status: response.status });
        }

        const data = await response.text();
        return new NextResponse(data, { status: 200 });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
