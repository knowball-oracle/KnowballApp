import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Input, Sheet, Text, useToast } from '@/components/ui';
import { championshipsService } from '@/services/championships';
import { gamesService } from '@/services/games';
import { invalidate } from '@/services/invalidation';
import { qk } from '@/services/queryKeys';
import type { Game } from '@/types/api';
import { category as categoryTokens, colors, space } from '@/theme/tokens';
import { brToLocalDate, isValidTime, localToBrDate, localToTime, maskDate, maskTime } from '@/utils/dates';
import { categoryLabel } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';

type Form = { championshipId: number | null; date: string; time: string; place: string; home: string; away: string };

/** Criar (game = null) ou editar uma partida. `visible` controla o sheet. */
export function GameFormSheet({
  visible,
  game,
  onClose,
  onSaved,
}: {
  visible: boolean;
  game: Game | null;
  onClose: () => void;
  onSaved?: (game: Game) => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const championships = useQuery({ queryKey: qk.championships, queryFn: championshipsService.list, enabled: visible });
  const [form, setForm] = useState<Form>({ championshipId: null, date: '', time: '', place: '', home: '0', away: '0' });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTouched(false);
    setForm(
      game
        ? {
            championshipId: game.championship?.id ?? null,
            date: localToBrDate(game.matchDate),
            time: localToTime(game.matchDate),
            place: game.place,
            home: String(game.homeScore),
            away: String(game.awayScore),
          }
        : { championshipId: null, date: '', time: '', place: '', home: '0', away: '0' },
    );
  }, [visible, game]);

  const localDate = brToLocalDate(form.date);
  const errors = {
    championship: !form.championshipId ? 'Selecione um campeonato.' : null,
    date: !localDate ? 'Informe uma data válida (dd/mm/aaaa).' : null,
    time: !isValidTime(form.time) ? 'Informe o horário (HH:mm).' : null,
    place: !form.place.trim() ? 'Informe o local da partida.' : null,
    score: form.home === '' || form.away === '' ? 'Informe o placar (0 para jogos futuros).' : null,
  };
  const invalid = Object.values(errors).some(Boolean);

  const save = useMutation({
    mutationFn: () => {
      const input = {
        championship: { id: form.championshipId as number },
        // LocalDateTime sem fuso (nunca toISOString).
        matchDate: `${localDate}T${form.time}:00`,
        place: form.place.trim(),
        homeScore: Number(form.home),
        awayScore: Number(form.away),
      };
      return game ? gamesService.update(game.id, input) : gamesService.create(input);
    },
    onSuccess: async (saved) => {
      await invalidate.games(qc);
      toast.success(game ? 'Partida atualizada.' : 'Partida criada. Adicione os times e a arbitragem.');
      onClose();
      onSaved?.(saved);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const submit = () => {
    setTouched(true);
    if (!invalid) save.mutate();
  };

  const list = [...(championships.data ?? [])].sort((a, b) => b.year - a.year || a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={game ? 'Editar partida' : 'Criar partida'}
      description="Gestão de partidas"
      footer={<Button title={game ? 'Salvar alterações' : 'Criar partida'} onPress={submit} loading={save.isPending} />}
    >
      <Text variant="label">Campeonato</Text>
      <View style={styles.wrap}>
        {list.map((c) => (
          <Chip
            key={c.id}
            label={`${c.name} (${c.year})`}
            color={categoryTokens[c.category]?.fg}
            active={form.championshipId === c.id}
            onPress={() => setForm({ ...form, championshipId: c.id })}
          />
        ))}
        {championships.isPending ? <Text variant="caption">Carregando campeonatos...</Text> : null}
        {!championships.isPending && list.length === 0 ? <Text variant="caption">Cadastre um campeonato primeiro.</Text> : null}
      </View>
      {touched && errors.championship ? (
        <Text variant="caption" color={colors.accent}>
          {errors.championship}
        </Text>
      ) : null}
      {form.championshipId ? (
        <Text variant="caption">
          Categoria: {categoryLabel(list.find((c) => c.id === form.championshipId)?.category ?? 'SUB_13')}
        </Text>
      ) : null}

      <View style={styles.row}>
        <Input
          label="Data"
          placeholder="dd/mm/aaaa"
          value={form.date}
          onChangeText={(t) => setForm({ ...form, date: maskDate(t) })}
          keyboardType="number-pad"
          maxLength={10}
          error={touched ? errors.date : null}
          containerStyle={styles.flex}
        />
        <Input
          label="Horário"
          placeholder="15:30"
          hint="Horário local"
          value={form.time}
          onChangeText={(t) => setForm({ ...form, time: maskTime(t) })}
          keyboardType="number-pad"
          maxLength={5}
          error={touched ? errors.time : null}
          containerStyle={styles.time}
        />
      </View>
      <Input
        label="Local"
        placeholder="Ex.: Estádio do Maracanã"
        value={form.place}
        onChangeText={(place) => setForm({ ...form, place })}
        maxLength={100}
        error={touched ? errors.place : null}
      />
      <View style={styles.row}>
        <Input
          label="Mandante"
          value={form.home}
          onChangeText={(t) => setForm({ ...form, home: t.replace(/\D/g, '').slice(0, 2) })}
          keyboardType="number-pad"
          containerStyle={styles.flex}
        />
        <Text variant="h2" style={styles.x}>
          ×
        </Text>
        <Input
          label="Visitante"
          value={form.away}
          onChangeText={(t) => setForm({ ...form, away: t.replace(/\D/g, '').slice(0, 2) })}
          keyboardType="number-pad"
          containerStyle={styles.flex}
        />
      </View>
      {touched && errors.score ? (
        <Text variant="caption" color={colors.accent}>
          {errors.score}
        </Text>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  flex: { flex: 1 },
  time: { width: 110 },
  x: { marginTop: 38 },
});
