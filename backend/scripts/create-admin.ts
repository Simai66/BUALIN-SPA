import bcrypt from 'bcrypt';
import { db } from '../src/config/db';

/**
 * CLI: Create an admin user
 * Usage:
 *   npm run create-admin -- --email admin2@example.com --password Admin@123 --name "Admin Two" --phone "0812345678"
 */
function printUsage() {
  console.log('Usage: npm run create-admin -- --email <email> --password <password> --name "Full Name" --phone "0800000000"');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (token.startsWith('--')) {
      const [key, maybeVal] = token.split('=');
      const k = key.replace(/^--/, '');
      if (maybeVal !== undefined) {
        result[k] = maybeVal;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        result[k] = args[i + 1];
        i++;
      } else {
        result[k] = '';
      }
    }
  }

  return result as { email?: string; password?: string; name?: string; phone?: string };
}

async function main() {
  const argv = parseArgs();
  const email = (argv.email || '').trim().toLowerCase();
  const password = argv.password || '';
  const full_name = (argv.name || '').trim();
  const phone = (argv.phone || '').trim();

  if (!email || !password || !full_name || !phone) {
    console.error('Missing required arguments.');
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    // Check if user exists
    const existing = await db('users').where({ email }).first();
    if (existing) {
      console.error(`User with email ${email} already exists (role=${existing.role}).`);
      process.exitCode = 1;
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert admin user (verified)
    await db('users').insert({
      full_name,
      email,
      phone,
      password_hash,
      is_verified: true,
      role: 'admin',
      verify_token: null,
      verify_token_expires: null,
    });

    console.log(`✅ Admin created: ${full_name} <${email}>`);
  } catch (err: any) {
    console.error('Failed to create admin:', err.message || err);
    process.exitCode = 1;
  } finally {
    // Ensure process exits cleanly
    await db.destroy();
  }
}

main();