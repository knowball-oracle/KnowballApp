import { GuardedStack } from '@/components/RoleGuard';

export default function UserLayout() {
  return <GuardedStack role="ROLE_USER" />;
}
