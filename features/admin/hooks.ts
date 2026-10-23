import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { invalidate } from '@/services/invalidation';
import { qk } from '@/services/queryKeys';
import { reportsService } from '@/services/reports';
import type { AnalysisResult, ReportStatus } from '@/types/api';

export function useAdminAnalytics() {
  const kpis = useQuery({ queryKey: qk.analytics.kpis, queryFn: analyticsService.kpis });
  const byMonth = useQuery({ queryKey: qk.analytics.byMonth(6), queryFn: () => analyticsService.byMonth(6) });
  const byStatus = useQuery({ queryKey: qk.analytics.byStatus, queryFn: analyticsService.byStatus });
  const byReferee = useQuery({ queryKey: qk.analytics.byReferee, queryFn: analyticsService.byReferee });
  const recent = useQuery({ queryKey: qk.analytics.recent(10), queryFn: () => analyticsService.recent(10) });
  const all = [kpis, byMonth, byStatus, byReferee, recent];
  return {
    kpis,
    byMonth,
    byStatus,
    byReferee,
    recent,
    isRefetching: all.some((q) => q.isRefetching),
    refetch: () => Promise.all(all.map((q) => q.refetch())),
  };
}

/** PUT /reports/{id}/status. RESOLVED exige resultado; os outros mandam null. */
export function useUpdateReportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, analysisResult }: { id: number; status: ReportStatus; analysisResult: AnalysisResult | null }) =>
      reportsService.updateStatus(id, { status, analysisResult }),
    onSuccess: () => invalidate.reportChanged(qc),
  });
}
