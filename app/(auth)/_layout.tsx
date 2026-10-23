import { GuardedStack } from '@/components/RoleGuard';

export default function AuthLayout() {
  return <GuardedStack role="guest" />;
}
