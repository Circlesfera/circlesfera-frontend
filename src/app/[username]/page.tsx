import { notFound } from 'next/navigation';
import { getUserProfileByUsername } from '@/services/userService';
import ClientProfilePage from './ClientProfilePage';

const RESERVED_ROUTES = [
  'login', 'register', 'explore', 'messages', 'notifications', 'profile', 'api'
];

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  if (RESERVED_ROUTES.includes(username.toLowerCase())) {
    return notFound();
  }

  let profile = null;
  try {
    profile = await getUserProfileByUsername(username);
  } catch {
    return notFound();
  }

  return <ClientProfilePage profile={profile} />;
}
