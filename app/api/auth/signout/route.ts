import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    const cookieStore = await cookies();

    const response = NextResponse.json({ success: true }, { status: 200 });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // Set on both cookieStore and response
                        cookieStore.set(name, value, options);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Sign out from Supabase - this will call setAll with empty/expired cookies
    await supabase.auth.signOut();

    // Manually delete all Supabase-related cookies to be sure
    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
            response.cookies.set(cookie.name, '', {
                maxAge: 0,
                path: '/',
            });
        }
    });

    return response;
}
