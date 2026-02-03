const KST_OFFSET = 9 * 60 * 60 * 1000;

export const BUILD_ID = new Date(Date.now() + KST_OFFSET).toISOString().slice(0, 10);
