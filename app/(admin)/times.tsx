import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Search, SearchX, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AdminHero } from '@/components/admin/AdminHero';
import { TeamBadge } from '@/components/game/TeamBadge';
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
} from '@/components/ui';
import { confirmDelete } from '@/features/admin/confirm';
import { invalidate } from '@/services/invalidation';
import { qk } from '@/services/queryKeys';
import { teamsService } from '@/services/teams';
import type { Team } from '@/types/api';
import { space } from '@/theme/tokens';
import { errorMessage } from '@/utils/parseApiError';
import { normalize } from '@/utils/text';

const image = require('@/assets/images/teams.jpg');

type Form = { id?: number; name: string; city: string; state: string; logoUrl: string | null };

export default function Times() {
  const qc = useQueryClient();
  const toast = useToast();
  const teams = useQuery({ queryKey: qk.teams, queryFn: teamsService.list });
  const [query, setQuery] = useState('');
  const [uf, setUf] = useState<string | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [touched, setTouched] = useState(false);

  const ufs = useMemo(
    () => [...new Set((teams.data ?? []).map((t) => t.state?.toUpperCase()).filter(Boolean))].sort(),
    [teams.data],
  );
  const list = useMemo(() => {
    const q = normalize(query);
    return (teams.data ?? [])
      .filter((t) => (!uf || t.state?.toUpperCase() === uf) && (!q || normalize(`${t.name} ${t.city}`).includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [teams.data, query, uf]);
  const withoutLogo = (teams.data ?? []).filter((t) => !t.logoUrl).length;

  const errors = form
    ? {
        name: !form.name.trim() ? 'Informe o nome do time.' : null,
        city: !form.city.trim() ? 'Informe a cidade do time.' : null,
        state: !/^[A-Z]{2}$/.test(form.state) ? 'Informe uma UF válida, como SP ou RJ.' : null,
      }
    : { name: null, city: null, state: null };

  const save = useMutation({
    mutationFn: (f: Form) => {
      // PUT substitui o objeto inteiro: preserva o escudo atual.
      const input = { name: f.name.trim(), city: f.city.trim(), state: f.state, logoUrl: f.logoUrl };
      return f.id ? teamsService.update(f.id, input) : teamsService.create(input);
    },
    onSuccess: async (_, f) => {
      await invalidate.teams(qc);
      toast.success(f.id ? 'Time atualizado.' : 'Time cadastrado.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: teamsService.remove,
    onSuccess: async () => {
      await invalidate.teams(qc);
      toast.success('Time excluído.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const syncAll = useMutation({
    mutationFn: teamsService.syncLogos,
    onSuccess: async (r) => {
      await invalidate.teams(qc);
      toast.success(`Escudos: ${r.updated} de ${r.total} atualizados${r.notFound ? `, ${r.notFound} não encontrados` : ''}.`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const syncOne = useMutation({
    mutationFn: teamsService.syncLogo,
    onSuccess: async () => {
      await invalidate.teams(qc);
      toast.success('Escudo sincronizado.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e).includes('encontrad') ? 'Escudo não encontrado para este time.' : errorMessage(e)),
  });

  const open = (t?: Team) => {
    setTouched(false);
    setForm(t ? { id: t.id, name: t.name, city: t.city, state: t.state.toUpperCase(), logoUrl: t.logoUrl } : { name: '', city: '', state: '', logoUrl: null });
  };

  const submit = () => {
    setTouched(true);
    if (!form || errors.name || errors.city || errors.state) return;
    save.mutate(form);
  };

  return (
    <Screen keyboard refreshing={teams.isRefetching} onRefresh={() => void teams.refetch()}>
      <AdminHero
        image={image}
        eyebrow="Times"
        title="Os times que formam"
        titleLight="o futuro do futebol."
        onNew={() => open()}
        imageAccessibilityLabel="Jogadores das categorias de base disputando uma partida"
      />

      <Panel>
        <Text variant="eyebrow">Panorama</Text>
        <Text variant="h1">{(teams.data ?? []).length}</Text>
        <Text variant="caption">times cadastrados · {withoutLogo} sem escudo</Text>
        <Button
          title={syncAll.isPending ? 'Sincronizando escudos...' : 'Sincronizar escudos'}
          variant="secondary"
          leftIcon={RefreshCw}
          icon={null}
          loading={syncAll.isPending}
          onPress={() => syncAll.mutate()}
          accessibilityHint="Busca o escudo de todos os times. Pode levar alguns segundos."
        />
      </Panel>

      <Input placeholder="Buscar time ou cidade..." icon={Search} value={query} onChangeText={setQuery} accessibilityLabel="Buscar time" />
      {ufs.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Todos os estados" active={!uf} onPress={() => setUf(null)} />
          {ufs.map((s) => (
            <Chip key={s} label={s} active={uf === s} onPress={() => setUf(uf === s ? null : s)} />
          ))}
        </ScrollView>
      ) : null}

      {teams.isPending ? (
        <SkeletonList count={4} lines={1} />
      ) : teams.isError ? (
        <ErrorState error={teams.error} title="Erro ao carregar times." onRetry={() => void teams.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={query || uf ? 'Nenhum time encontrado.' : 'Nenhum time cadastrado.'}
          actionLabel={query || uf ? 'Limpar filtros' : 'Cadastrar time'}
          onAction={() => (query || uf ? (setQuery(''), setUf(null)) : open())}
        />
      ) : (
        <View style={styles.list}>
          <Text variant="caption">
            {list.length} {list.length === 1 ? 'time' : 'times'}
            {uf ? ` em ${uf}` : ''}
          </Text>
          {list.map((t) => (
            <Card key={t.id} onPress={() => open(t)} accessibilityLabel={`${t.name}, ${t.city} ${t.state}. Editar`} style={styles.card}>
              <TeamBadge team={t} size={40} />
              <View style={styles.flex}>
                <Text variant="label">{t.name}</Text>
                <Text variant="caption">{t.city}</Text>
              </View>
              <Badge label={t.state?.toUpperCase()} />
            </Card>
          ))}
        </View>
      )}

      <Sheet
        visible={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar time' : 'Cadastrar time'}
        description="Gestão de times"
        footer={
          <>
            <Button title={form?.id ? 'Salvar alterações' : 'Cadastrar time'} onPress={submit} loading={save.isPending} />
            {form?.id ? (
              <>
                <Button
                  title="Sincronizar escudo"
                  variant="secondary"
                  leftIcon={RefreshCw}
                  icon={null}
                  loading={syncOne.isPending}
                  onPress={() => form.id && syncOne.mutate(form.id)}
                />
                <Button
                  title="Excluir time"
                  variant="danger"
                  leftIcon={Trash2}
                  icon={null}
                  loading={remove.isPending}
                  onPress={() => confirmDelete('Excluir time', 'Esta ação não pode ser desfeita.', () => form.id && remove.mutate(form.id))}
                />
              </>
            ) : null}
          </>
        }
      >
        {form ? (
          <>
            <Input label="Nome" placeholder="Ex.: Flamengo" value={form.name} onChangeText={(name) => setForm({ ...form, name })} maxLength={100} error={touched ? errors.name : null} />
            <Input label="Cidade" placeholder="Ex.: São Paulo" value={form.city} onChangeText={(city) => setForm({ ...form, city })} maxLength={100} error={touched ? errors.city : null} />
            <Input
              label="UF"
              placeholder="SP"
              hint="Informe a sigla com duas letras."
              value={form.state}
              onChangeText={(t) => setForm({ ...form, state: t.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2) })}
              autoCapitalize="characters"
              maxLength={2}
              error={touched ? errors.state : null}
            />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: space.sm, paddingVertical: space.xs },
  list: { gap: space.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1, gap: 2 },
});
