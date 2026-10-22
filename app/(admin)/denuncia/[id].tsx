import { useLocalSearchParams } from 'expo-router';
import { AdminStatusPanel } from '@/components/report/AdminStatusPanel';
import { ReportDetailView } from '@/components/report/ReportDetailView';

export default function DenunciaAdmin() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReportDetailView id={Number(id)} showReporter adminPanel={(r) => <AdminStatusPanel report={r} />} />;
}
