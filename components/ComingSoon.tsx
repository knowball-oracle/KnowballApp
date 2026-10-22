import { Hammer } from 'lucide-react-native';
import { EmptyState, PageHeader, Screen } from '@/components/ui';

/** Tela provisória enquanto a fase dela não chega. */
export function ComingSoon({
  title,
  phase,
  eyebrow,
  back,
  withTabBar,
}: {
  title: string;
  phase: string;
  eyebrow?: string;
  back?: boolean;
  withTabBar?: boolean;
}) {
  return (
    <Screen withTabBar={withTabBar}>
      <PageHeader eyebrow={eyebrow} title={title} back={back} />
      <EmptyState icon={Hammer} title={`Chega na Fase ${phase}`} message="Esta tela ainda está em construção." />
    </Screen>
  );
}
