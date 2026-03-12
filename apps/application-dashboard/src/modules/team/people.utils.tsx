import { COLORS, TEAMS_COLORS, TEAMS_DARK_COLORS } from '@zamp-platform/ui';

/**
 * Resolves a team chip background color based on the current theme.
 * Maps light pastel colors to their dark equivalents when in dark mode.
 */
const TEAM_COLOR_DARK_MAP: Record<string, string> = Object.fromEntries(
  TEAMS_COLORS.map((light, i) => [light.toLowerCase(), TEAMS_DARK_COLORS[i]]),
);

export const resolveChipColor = (color: string | undefined, isDark: boolean): string => {
  if (!color) return isDark ? COLORS.GRAY_800 : COLORS.WHITE;

  return isDark ? (TEAM_COLOR_DARK_MAP[color.toLowerCase()] ?? color) : color;
};

/**
 * Extracts email from various formats:
 * - "Name <email@domain.com>" -> "email@domain.com"
 * - "<email@domain.com>" -> "email@domain.com"
 * - "email@domain.com" -> "email@domain.com"
 */
export const extractEmailFromEntry = (entry: string): string => {
  const trimmed = entry?.trim();

  if (!trimmed) return '';

  // Match "Name <email@domain.com>" format - extract email from angle brackets
  const angleEmailMatch = trimmed.match(/<([^>]+)>/);

  if (angleEmailMatch) {
    return angleEmailMatch[1]?.trim() || '';
  }

  // If no angle brackets, return as-is (plain email or space-separated emails)
  return trimmed;
};

/**
 * Extracts all emails from a search value that may contain:
 * - Multiple comma or semicolon-separated entries
 * - "Name <email>" format entries
 * - Plain email addresses
 * - Space-separated emails
 *
 * Example input: "Hello World <hello@example.com>, Test <test@example.com>; Jane Doe <jane@example.com>"
 * Example output: ["hello@example.com", "test@example.com", "jane@example.com"]
 */
export const extractEmailsFromSearchValue = (value: string): string[] => {
  // Split by both comma and semicolon as delimiters
  const separatedEntries = value.split(/[,;]/);
  const emails: string[] = [];

  separatedEntries.forEach((entry) => {
    const extractedEmail = extractEmailFromEntry(entry);

    if (extractedEmail) {
      // If the extracted value contains spaces and no angle brackets,
      // split by space to handle multiple plain emails
      if (extractedEmail.includes(' ') && !extractedEmail.includes('<')) {
        extractedEmail.split(/\s+/).forEach((email) => {
          const trimmedEmail = email?.trim();

          if (trimmedEmail) emails.push(trimmedEmail);
        });
      } else {
        emails.push(extractedEmail);
      }
    }
  });

  return emails;
};
