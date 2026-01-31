// This file is used to hold instrumentation methods for Next.js
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('../sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('../sentry.edge.config');
    }
}

export const onRequestError = async (
    error: Error,
    request: { path: string; method: string; headers: Record<string, string> },
    context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) => {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(error, {
        extra: {
            request,
            context,
        },
    });
};
