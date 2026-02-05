import { text } from 'drizzle-orm/sqlite-core';

// getClientAddress() always returns a string.
export const ip = text({ length: 45 }).notNull();

// SQLite `INTEGER PRIMARY KEY` columns should be used with caution.
// Therefore, ULID based text primary keys are used in this template.
// See https://github.com/drizzle-team/drizzle-orm/issues/1980
// See https://github.com/drizzle-team/drizzle-orm/issues/2611

// If a `text().primaryKey().$default(ulid)` column is used,
// the `created_at` value can be calculated from the ULID.
// See https://github.com/ulid/javascript/issues/65
