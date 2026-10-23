import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, SearchX, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AdminHero } from '@/components/admin/AdminHero';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Panel,
  Screen,
  Sheet,
  SkeletonList,
  Text,
  useToast,
  type Tone,
} from '@/components/ui';
import { confirmDelete } from '@/features/admin/confirm';
import { invalidate } from '@/services/invalidation';
import { qk } from '@/services/queryKeys';
import { refereesService } from '@/services/referees';
import type { Referee, RefereeStatus } from '@/types/api';
import { colors, radius, space, status as statusTokens, ui } from '@/theme/tokens';
import { ageFrom, brToLocalDate, formatLocalDate, localToBrDate, maskDate } from '@/utils/dates';
import { REFEREE_STATUS_ORDER, refereeStatusLabel, refereeStatusPlural } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';
import { initials, normalize } from '@/utils/text';

const image = require('@/assets/images/referee.jpg');

const refereeTone: Record<RefereeStatus, Tone> = {
  ACTIVE: statusTokens.RESOLVED,
  INACTIVE: { fg: colors.textSecondary, bg: ui.fill, border: colors.border },
  SUSPENDED: { fg: colors.accentSoft, bg: ui.dangerBg, border: ui.dangerBg },
};

type Form = { id?: number; name: string; birth: string; status: RefereeStatus };
const EMPTY: Form = { name: '', birth: '', status: 'ACTIVE' };

export default function Arbitros() {
  const qc = useQueryClient();
  const toast = useToast();
  const referees = useQuery({ queryKey: qk.referees, queryFn: refereesService.list });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RefereeStatus | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [touched, setTouched] = useState(false);

  const counts = useMemo(() => {
    const c = { ACTIVE: 0, INACTIVE: 0, SUSPENDED: 0 } as Record<RefereeStatus, number>;
    for (const r of referees.data ?? []) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [referees.data]);

  const list = useMemo(() => {
    const q = normalize(query);
    return (referees.data ?? [])
      .filter((r) => (!filter || r.status === filter) && (!q || normalize(r.name).includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [referees.data, query, filter]);

  const birthDate = form ? brToLocalDate(form.birth) : null;
  const nameError = form && !form.name.trim() ? 'Informe o nome completo do árbitro.' : null;
  const birthError = form && !birthDate ? 'Informe uma data de nascimento válida (dd/mm/aaaa).' : null;

  const save = useMutation({
    mutationFn: (f: Form) => {
      const input = { name: f.name.trim(), birthDate: brToLocalDate(f.birth) as string, status: f.status };
      return f.id ? refereesService.update(f.id, input) : refereesService.create(input);
    },
    onSuccess: async (_, f) => {
      await invalidate.referees(qc);
      toast.success(f.id ? 'Árbitro atualizado.' : 'Árbitro cadastrado.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: refereesService.remove,
    onSuccess: async () => {
      await invalidate.referees(qc);
      toast.success('Árbitro excluído.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const open = (r?: Referee) => {
    setTouched(false);
    setForm(r ? { id: r.id, name: r.name, birth: localToBrDate(r.birthDate), status: r.status } : EMPTY);
  };

  const submit = () => {
    setTouched(true);
    if (!form || nameError || birthError) return;
    save.mutate(form);
  };

  return (
    <Screen keyboard refreshing={referees.isRefetching} onRefresh={() => void referees.refetch()}>
      <AdminHero
        image={image}
        eyebrow="Árbitros"
        title="Conheça os profissionais"
        titleLight="que conduzem o jogo."
        newLabel="Novo"
        onNew={() => open()}
        imageAccessibilityLabel="Árbitro exibindo um cartão vermelho durante uma partida"
      />

      <Panel>
        <Text variant="eyebrow">Panorama da arbitragem</Text>
        <Text variant="h1">{(referees.data ?? []).length}</Text>
        <Text variant="caption">árbitros cadastrados</Text>
        <View style={styles.panorama}>
          {REFEREE_STATUS_ORDER.map((s) => (
            <Badge key={s} label={`${refereeStatusPlural[s]}: ${counts[s]}`} tone={refereeTone[s]} />
          ))}
        </View>
      </Panel>

      <Input placeholder="Buscar árbitro pelo nome..." icon={Search} value={query} onChangeText={setQuery} accessibilityLabel="Buscar árbitro" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {REFEREE_STATUS_ORDER.map((s) => (
          <Chip
            key={s}
            label={refereeStatusPlural[s]}
            color={refereeTone[s].fg}
            count={counts[s]}
            active={filter === s}
            onPress={() => setFilter(filter === s ? null : s)}
          />
        ))}
      </ScrollView>

      {referees.isPending ? (
        <SkeletonList count={4} lines={2} />
      ) : referees.isError ? (
        <ErrorState error={referees.error} title="Erro ao carregar árbitros." onRetry={() => void referees.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={query || filter ? 'Nenhum árbitro encontrado.' : 'Nenhum árbitro cadastrado.'}
          actionLabel={query || filter ? 'Limpar filtros' : 'Cadastrar árbitro'}
          onAction={() => (query || filter ? (setQuery(''), setFilter(null)) : open())}
        />
      ) : (
        <View style={styles.list}>
          <Text variant="caption">
            Exibindo {list.length} de {(referees.data ?? []).length} árbitros
          </Text>
          {list.map((r) => {
            const age = ageFrom(r.birthDate);
            return (
              <Card key={r.id} onPress={() => open(r)} accessibilityLabel={`${r.name}, ${refereeStatusLabel[r.status]}. Editar`} style={styles.card}>
                <View style={styles.avatar}>
                  <Text variant="label">{initials(r.name)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text variant="label">{r.name}</Text>
                  <Text variant="caption">
                    {formatLocalDate(r.birthDate)} · {age !== null ? `${age} anos` : 'Idade não informada'}
                  </Text>
                </View>
                <Badge label={refereeStatusLabel[r.status]} tone={refereeTone[r.status]} />
              </Card>
            );
          })}
        </View>
      )}

      <Sheet
        visible={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar árbitro' : 'Cadastrar árbitro'}
        description="Gestão de árbitros"
        footer={
          <>
            <Button title={form?.id ? 'Salvar alterações' : 'Cadastrar árbitro'} onPress={submit} loading={save.isPending} />
            {form?.id ? (
              <Button
                title="Excluir árbitro"
                variant="danger"
                leftIcon={Trash2}
                icon={null}
                loading={remove.isPending}
                onPress={() =>
                  confirmDelete('Excluir árbitro', 'Esta ação não pode ser desfeita.', () => form.id && remove.mutate(form.id))
                }
              />
            ) : null}
          </>
        }
      >
        {form ? (
          <>
            <Input
              label="Nome completo"
              placeholder="Ex.: João da Silva"
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
              autoCapitalize="words"
              maxLength={100}
              error={touched ? nameError : null}
            />
            <Input
              label="Data de nascimento"
              placeholder="dd/mm/aaaa"
              value={form.birth}
              onChangeText={(t) => setForm({ ...form, birth: maskDate(t) })}
              keyboardType="number-pad"
              maxLength={10}
              error={touched ? birthError : null}
            />
            <Text variant="label">Status</Text>
            <View style={styles.chipsWrap}>
              {REFEREE_STATUS_ORDER.map((s) => (
                <Chip
                  key={s}
                  label={refereeStatusLabel[s]}
                  color={refereeTone[s].fg}
                  active={form.status === s}
                  onPress={() => setForm({ ...form, status: s })}
                />
              ))}
            </View>
            {form.status === 'SUSPENDED' ? (
              <Text variant="caption">Árbitros denunciados são suspensos automaticamente. Reative quando a análise permitir.</Text>
            ) : null}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panorama: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chips: { gap: space.sm, paddingVertical: space.xs },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  list: { gap: space.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: ui.fill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
});
