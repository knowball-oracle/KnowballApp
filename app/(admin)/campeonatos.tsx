import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, SearchX, Trash2, Trophy } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminHero } from '@/components/admin/AdminHero';
import {
  Badge,
  Button,
  Card,
  CategoryBadge,
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
import { championshipsService } from '@/services/championships';
import { invalidate } from '@/services/invalidation';
import { qk } from '@/services/queryKeys';
import type { Category, Championship } from '@/types/api';
import { category as categoryTokens, colors, size, space, ui } from '@/theme/tokens';
import { CATEGORY_ORDER, categoryLabel, categoryStage } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';
import { normalize } from '@/utils/text';

const image = require('@/assets/images/championships.jpg');

type Form = { id?: number; name: string; year: string; category: Category | null };

export default function Campeonatos() {
  const qc = useQueryClient();
  const toast = useToast();
  const championships = useQuery({ queryKey: qk.championships, queryFn: championshipsService.list });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Category | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [touched, setTouched] = useState(false);

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const ch of championships.data ?? []) c[ch.category] = (c[ch.category] ?? 0) + 1;
    return c;
  }, [championships.data]);

  const list = useMemo(() => {
    const q = normalize(query);
    return (championships.data ?? [])
      .filter((c) => (!filter || c.category === filter) && (!q || normalize(c.name).includes(q)))
      .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name, 'pt-BR'));
  }, [championships.data, query, filter]);

  const year = form ? Number(form.year) : NaN;
  const errors = form
    ? {
        name: !form.name.trim() ? 'Informe o nome do campeonato.' : null,
        year: !Number.isInteger(year) || year < 1900 || year > 2100 ? 'Informe um ano válido.' : null,
        category: !form.category ? 'Selecione uma categoria.' : null,
      }
    : { name: null, year: null, category: null };

  const save = useMutation({
    mutationFn: (f: Form) => {
      const input = { name: f.name.trim(), year: Number(f.year), category: f.category as Category };
      return f.id ? championshipsService.update(f.id, input) : championshipsService.create(input);
    },
    onSuccess: async (_, f) => {
      await invalidate.championships(qc);
      toast.success(f.id ? 'Campeonato atualizado.' : 'Campeonato criado.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: championshipsService.remove,
    onSuccess: async () => {
      await invalidate.championships(qc);
      toast.success('Campeonato excluído.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const open = (c?: Championship) => {
    setTouched(false);
    setForm(
      c
        ? { id: c.id, name: c.name, year: String(c.year), category: c.category }
        : { name: '', year: String(new Date().getFullYear()), category: null },
    );
  };

  const submit = () => {
    setTouched(true);
    if (!form || errors.name || errors.year || errors.category) return;
    save.mutate(form);
  };

  return (
    <Screen keyboard refreshing={championships.isRefetching} onRefresh={() => void championships.refetch()}>
      <AdminHero
        image={image}
        eyebrow="Campeonatos"
        title="Acompanhe os campeonatos"
        titleLight="da base do futebol brasileiro."
        onNew={() => open()}
        imageAccessibilityLabel="Troféu de futebol"
      />

      <Panel>
        <Text variant="eyebrow">Panorama</Text>
        <Text variant="h1">{(championships.data ?? []).length}</Text>
        <Text variant="caption">campeonatos monitorados</Text>
        <View style={styles.wrap}>
          {CATEGORY_ORDER.map((c) => (
            <Badge key={c} label={`${categoryLabel(c)}: ${counts[c] ?? 0}`} tone={categoryTokens[c]} />
          ))}
        </View>
      </Panel>

      <Input placeholder="Buscar campeonato pelo nome..." icon={Search} value={query} onChangeText={setQuery} accessibilityLabel="Buscar campeonato" />
      <View style={styles.wrap}>
        {CATEGORY_ORDER.map((c) => (
          <Chip
            key={c}
            label={categoryLabel(c)}
            color={categoryTokens[c].fg}
            count={counts[c] ?? 0}
            active={filter === c}
            onPress={() => setFilter(filter === c ? null : c)}
          />
        ))}
      </View>

      {championships.isPending ? (
        <SkeletonList count={4} lines={2} />
      ) : championships.isError ? (
        <ErrorState error={championships.error} title="Erro ao carregar campeonatos." onRetry={() => void championships.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={query || filter ? 'Nenhum campeonato encontrado.' : 'Nenhum campeonato cadastrado.'}
          actionLabel={query || filter ? 'Limpar filtros' : 'Criar campeonato'}
          onAction={() => (query || filter ? (setQuery(''), setFilter(null)) : open())}
        />
      ) : (
        <View style={styles.list}>
          {list.map((c) => (
            <Card key={c.id} onPress={() => open(c)} accessibilityLabel={`${c.name}, ${c.year}, ${categoryLabel(c.category)}. Editar`} style={styles.card}>
              <View style={styles.icon}>
                <Trophy size={size.icon} color={categoryTokens[c.category]?.fg ?? colors.text} />
              </View>
              <View style={styles.flex}>
                <Text variant="label" numberOfLines={2}>
                  {c.name}
                </Text>
                <Text variant="caption">
                  {c.year} · {categoryStage[c.category] ?? 'Sem categoria definida'}
                </Text>
              </View>
              <CategoryBadge value={c.category} />
            </Card>
          ))}
        </View>
      )}

      <Sheet
        visible={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar campeonato' : 'Criar campeonato'}
        description="Gestão de campeonatos"
        footer={
          <>
            <Button title={form?.id ? 'Salvar alterações' : 'Criar campeonato'} onPress={submit} loading={save.isPending} />
            {form?.id ? (
              <Button
                title="Excluir campeonato"
                variant="danger"
                leftIcon={Trash2}
                icon={null}
                loading={remove.isPending}
                onPress={() =>
                  confirmDelete(
                    'Excluir campeonato',
                    'Esta ação não pode ser desfeita. Partidas vinculadas também serão afetadas.',
                    () => form.id && remove.mutate(form.id),
                  )
                }
              />
            ) : null}
          </>
        }
      >
        {form ? (
          <>
            <Input
              label="Nome"
              placeholder="Ex.: Campeonato Brasileiro Sub-17"
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
              maxLength={100}
              error={touched ? errors.name : null}
            />
            <Input
              label="Ano"
              placeholder="2026"
              value={form.year}
              onChangeText={(t) => setForm({ ...form, year: t.replace(/\D/g, '').slice(0, 4) })}
              keyboardType="number-pad"
              maxLength={4}
              error={touched ? errors.year : null}
            />
            <Text variant="label">Categoria</Text>
            <View style={styles.wrap}>
              {CATEGORY_ORDER.map((c) => (
                <Chip
                  key={c}
                  label={categoryLabel(c)}
                  color={categoryTokens[c].fg}
                  active={form.category === c}
                  onPress={() => setForm({ ...form, category: c })}
                />
              ))}
            </View>
            {touched && errors.category ? (
              <Text variant="caption" color={colors.accent}>
                {errors.category}
              </Text>
            ) : null}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  list: { gap: space.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: {
    width: size.statIcon,
    height: size.statIcon,
    borderRadius: size.statIconRadius,
    backgroundColor: ui.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
});
