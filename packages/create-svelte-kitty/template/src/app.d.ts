import type { Role } from '$lib/server/db/schema.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session?: {
				id: string; // jti
				userId: string; // sub
				expiresAt: Date; // exp
				roles: ReadonlySet<Role>;
				isAdmin: boolean;
				profile: boolean;
			};
		}
		interface PageData {
			pageTitle: string;
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}
