/**
 * Curated list of high-exposure breached passwords, keyboard walks, and pattern rules
 */

export const TOP_BREACHED_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234",
  "111111", "1234567", "dragon", "welcome", "football", "master", "monkey",
  "iloveyou", "secret", "trustno1", "letmein", "princess", "shadow", "sunshine",
  "michael", "batman", "password1", "admin", "root", "guest", "access", "login",
  "pass1234", "123123", "654321", "superman", "starwars", "orange", "yellow",
  "charlie", "jessica", "killer", "matrix", "pokemon", "hunter2", "hockey",
  "soccer", "baseball", "computer", "daniel", "thomas", "robert", "anthony",
  "andrew", "joshua", "system", "default", "changeme", "test", "demo",
  "liverpool", "arsenal", "chelsea", "barcelona", "realmadrid", "harley",
  "mercedes", "ferrari", "corvette", "mustang", "summer", "winter", "spring",
  "autumn", "november", "december", "january", "flower", "peanut", "cookie",
  "coffee", "chocolate", "cheese", "whiskey", "tequila", "rainbow", "thunder",
  "silver", "golden", "diamond", "qwertz", "asdfgh", "zxcvbn", "1q2w3e",
  "p@ssword", "p@$$w0rd", "passw0rd", "admin123", "root123", "user123",
  "welcome1", "welcome123", "secret123", "iloveme", "fuckyou", "bitch",
  "whatever", "nothing", "freedom", "forever", "angel", "blessed", "genesis"
]);

export const KEYBOARD_WALKS = [
  "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "1234567890", "!@#$%^&*()",
  "poiuytrewq", "lkjhgfdsa", "mnbvcxz",
  "0987654321", ")(*&^%$#@!",
  "qazwsxedc", "wsxedcrfv", "edcrfvtgb", "rfvtgbyhn",
  "yhnujmik", "ujmikol", "rfvtgb"
];

export const COMMON_SUBSTRINGS = [
  "password", "admin", "secret", "welcome", "master", "dragon", "monkey",
  "shadow", "sunshine", "football", "soccer", "baseball", "access", "system",
  "winter", "spring", "summer", "autumn", "default", "root", "oracle", "cisco",
  "matrix", "qwerty", "asdfgh", "zxcvbn", "letmein", "trustno1", "superman",
  "batman", "pokemon", "starwars", "login", "guest"
];

export const LEET_MAP: Record<string, string> = {
  "@": "a", "4": "a",
  "8": "b",
  "3": "e",
  "1": "i", "!": "i", "|": "i",
  "0": "o",
  "$": "s", "5": "s",
  "7": "t", "+": "t"
};

/**
 * Normalizes leetspeak string back to standard lowercase english characters
 */
export function normalizeLeet(str: string): string {
  let result = "";
  for (const char of str.toLowerCase()) {
    result += LEET_MAP[char] || char;
  }
  return result;
}
