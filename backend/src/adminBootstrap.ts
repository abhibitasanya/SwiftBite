import type { RowDataPacket } from "mysql2/promise";
import { db } from "./db.js";

const ADMIN_NAME = "Admin";
const ADMIN_EMAIL = "admin@gmail.com";
const MIN_PASSWORD_LENGTH = 16;

export async function bootstrapAdminAccount(): Promise<void> {
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) return;

  if (password.length < MIN_PASSWORD_LENGTH || password.trim().length === 0) {
    throw new Error(
      `ADMIN_BOOTSTRAP_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }

  const [existingAccounts] = await db.query<RowDataPacket[]>(
    `SELECT id
     FROM users
     WHERE LOWER(TRIM(identifier)) = LOWER(?) AND role = 'platform'
     LIMIT 1`,
    [ADMIN_EMAIL],
  );

  if (existingAccounts.length > 0) {
    console.info(
      `Admin bootstrap skipped: ${ADMIN_EMAIL} already has a platform account. Remove ADMIN_BOOTSTRAP_PASSWORD.`,
    );
    return;
  }

  try {
    await db.query(
      `INSERT INTO users (full_name, identifier, role, password_hash)
       VALUES (?, ?, 'platform', SHA2(?, 256))`,
      [ADMIN_NAME, ADMIN_EMAIL, password],
    );
    console.info(
      `Admin account ${ADMIN_EMAIL} created. Remove ADMIN_BOOTSTRAP_PASSWORD from the environment.`,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      console.info(
        `Admin bootstrap skipped: ${ADMIN_EMAIL} was provisioned by another server instance.`,
      );
      return;
    }

    throw error;
  }
}
