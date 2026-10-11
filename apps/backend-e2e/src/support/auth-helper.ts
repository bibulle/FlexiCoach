import axios from 'axios';

export const API_URL = process.env.API_URL || 'http://localhost:3000';

/** Password that satisfies RegisterDto (8+ chars, upper, lower, digit). */
export const TEST_PASSWORD = 'Password123';

export interface TestUser {
  email: string;
  password: string;
  displayName: string;
  userId: string;
  accessToken: string;
}

let counter = 0;

/** Builds a unique e-mail so that every run starts from fresh users. */
export function uniqueEmail(label: string): string {
  counter += 1;
  return `${label}-${Date.now()}-${counter}@example.com`;
}

/** Registers a brand new user through the public API and returns its token. */
export async function registerUser(label: string): Promise<TestUser> {
  const email = uniqueEmail(label);
  const displayName = `E2E ${label}`;
  const res = await axios.post(`${API_URL}/api/auth/register`, {
    email,
    password: TEST_PASSWORD,
    displayName,
  });

  return {
    email,
    password: TEST_PASSWORD,
    displayName,
    userId: res.data.user._id,
    accessToken: res.data.access_token,
  };
}

/** Axios config carrying the bearer token of the given user. */
export function authHeaders(user: Pick<TestUser, 'accessToken'>) {
  return { headers: { Authorization: `Bearer ${user.accessToken}` } };
}

/** Flattens a NestJS error message (string or validation array). */
export function errorMessage(error: any): string {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(' | ') : String(message ?? '');
}
