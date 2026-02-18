/**
 * Error message keys and formatting for evalla errors.
 * 
 * These enum values are used as error messages throughout the library.
 * For internationalization, use the `formatErrorMessage()` function to get
 * human-readable messages in different languages.
 * 
 * Language dictionaries are in the `messages/` folder - each language has its own file.
 * 
 * ## Usage
 * 
 * ```typescript
 * // Throw an error with the key
 * throw new ValidationError(ErrorMessage.INPUT_MUST_BE_ARRAY);
 * 
 * // Get a human-readable message
 * const message = formatErrorMessage(ErrorMessage.INPUT_MUST_BE_ARRAY, 'en');
 * // Returns: "Input must be an array"
 * ```
 * 
 * ## Adding a New Error
 * 
 * 1. Add to the enum in `error-message-keys.ts`:
 * ```typescript
 * export enum ErrorMessage {
 *   // ... existing
 *   MY_NEW_ERROR = 'MY_NEW_ERROR',
 * }
 * ```
 * 
 * 2. Add to each language dictionary in `messages/` folder:
 * ```typescript
 * // messages/en.ts
 * export const messages_en: Record<ErrorMessage, string> = {
 *   // ... existing
 *   [ErrorMessage.MY_NEW_ERROR]: 'My error message',
 * };
 * ```
 * 
 * ## Adding a New Language
 * 
 * 1. Create a new file in `messages/` folder (e.g., `messages/es.ts`):
 * ```typescript
 * import { ErrorMessage } from '../error-message-keys';
 * 
 * export const messages_es: Record<ErrorMessage, string> = {
 *   [ErrorMessage.INPUT_MUST_BE_ARRAY]: 'La entrada debe ser un array',
 *   // ... translate all messages
 * };
 * ```
 * 
 * 2. Import in this file and update `formatErrorMessage()` to support the new language.
 */

// Re-export the enum from its dedicated file
export { ErrorMessage } from './error-message-keys';

// Import for use in this file
import { ErrorMessage } from './error-message-keys';

// Import language dictionaries
import { messages_en } from './messages/en';

/**
 * Format an error message key into a human-readable message in the specified language.
 * 
 * This function is optional - error keys themselves are used as error messages.
 * Use this function when you need human-readable messages for display purposes.
 * 
 * @param key - The error message enum value
 * @param lang - Language code (currently only 'en' supported)
 * @param params - Optional parameters to substitute in the message
 * @returns The formatted, human-readable error message
 * 
 * @example
 * ```typescript
 * // Get English message
 * formatErrorMessage(ErrorMessage.UNDEFINED_VARIABLE, 'en', { name: 'x' })
 * // Returns: "Undefined variable: x"
 * 
 * // With location info
 * formatErrorMessage(ErrorMessage.PARSE_ERROR_AT_LOCATION, 'en', { 
 *   line: 1, 
 *   column: 5, 
 *   message: 'Unexpected token' 
 * })
 * // Returns: "Parse error at line 1, column 5: Unexpected token"
 * ```
 */
export function formatErrorMessage(
  key: ErrorMessage, 
  lang: 'en' = 'en',
  params?: Record<string, any>
): string {
  // Currently only English is supported
  // To add more languages, import their dictionaries and add to this switch
  const dictionary = messages_en;
  let message = dictionary[key];
  
  if (params) {
    // Replace {param} placeholders with actual values
    for (const [param, value] of Object.entries(params)) {
      message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }
  }
  
  return message;
}
