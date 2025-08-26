"use server"
import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';

const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function assignRole(role: 'candidate' | 'employee' | 'admin') {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const res = await client.users.updateUser(userId, { publicMetadata: { role } });
  console.log(res)
}
