import { redirect } from 'next/navigation';
import { getLandingRoute } from '@/utils/route.util';

export default async function Home() {
  redirect(getLandingRoute());
}
