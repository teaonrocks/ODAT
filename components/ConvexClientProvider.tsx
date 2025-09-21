"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

type Props = { children: ReactNode };

export function ConvexClientProvider({ children }: Props) {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		if (typeof window !== "undefined") {
			// eslint-disable-next-line no-console
			console.warn(
				"NEXT_PUBLIC_CONVEX_URL is not set; Convex client disabled."
			);
		}
	}

	const client = useMemo(() => {
		// When url is undefined, ConvexReactClient will throw; guard in dev.
		return convexUrl ? new ConvexReactClient(convexUrl) : undefined;
	}, [convexUrl]);

	if (!client) return <>{children}</>;
	return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
