import { text } from 'drizzle-orm/sqlite-core';

export const userIp = text({ length: 45 });

// SQLite `INTEGER PRIMARY KEY` columns should be used with caution.
// Therefore, ULID based text primary keys are used in this template.
// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/1980
// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/2611
