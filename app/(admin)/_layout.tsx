import { GuardedStack } from '@/components/RoleGuard';

export default function AdminLayout() {
  return <GuardedStack role="ROLE_ADMIN" />;
}
