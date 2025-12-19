import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // next parameter is optional, if it's there use it, otherwise default to planning
    const next = searchParams.get('next') ?? '/planning';

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error, data } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.session) {
            // Check if this is a password recovery flow
            // If the user is coming from a 'recovery' email, we might want to redirect them to a specific update-password page
            const isRecovery = searchParams.get('type') === 'recovery' || request.url.includes('type=recovery');

            if (isRecovery) {
                return NextResponse.redirect(`${origin}/login/reset-password`);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
