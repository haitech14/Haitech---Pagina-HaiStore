export const VALID_HTML_PREFIXES: string[];
export const STORE_SHOWCASE_SLUGS: Set<string>;
export const VITRINA_CANONICAL_PATH: Record<string, string>;

export function vitrinaCanonicalPath(slug: string | null | undefined): string;
export function indexableRobots(): string;
export function isValidHtmlPath(pathname: string): boolean;
export function looksLikeLegacyCmsPath(pathname: string): boolean;
