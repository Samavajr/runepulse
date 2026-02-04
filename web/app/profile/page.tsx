import { redirect } from 'next/navigation';

export default function ProfileRedirect({ searchParams }) {
  const username = (searchParams?.username || '').toString().trim();
  if (!username) {
    redirect('/');
  }
  redirect(`/profile/${encodeURIComponent(username)}`);
}
