import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function Home() {
  redirect(ROUTES_PATH.PROCESSES);
}
