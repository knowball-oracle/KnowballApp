import { useLocalSearchParams } from 'expo-router';
import { ReportDetailView } from '@/components/report/ReportDetailView';

export default function DenunciaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReportDetailView id={Number(id)} />;
}
