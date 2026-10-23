import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Search, Trash2, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  GlassPill,
  Input,
  PageHeader,
  Screen,
  Sheet,
  SkeletonList,
  Text,
  useToast,
} from '@/components/ui';
import { confirmDelete } from '@/features/admin/confirm';
import { invalidate } from '@/services/invalidation';
import { qk } from '@/services/queryKeys';
import { USERS_PAGE_SIZE, usersService } from '@/services/users';
import { useSession } from '@/session/SessionProvider';
import type { Role, UserResponse } from '@/types/api';
import { role as roleTokens, space } from '@/theme/tokens';
import { roleLabel } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';
import { validateEmail } from '@/utils/validation';

type Form = { id?: number; name: string; email: string; password: string; role: Role };
const ROLES: Role[] = ['ROLE_USER', 'ROLE_ADMIN'];

export default function Usuarios() {
  const qc = useQueryClient();
  const toast = useToast();
  const { user: me } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [filters, setFilters] = useState({ name: '', email: '' });
  const [form, setForm] = useState<Form | null>(null);
  const [touched, setTouched] = useState(false);

  const users = useInfiniteQuery({
    queryKey: qk.users(filters),
    queryFn: ({ pageParam }) => usersService.list({ ...filters, page: pageParam, size: USERS_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
  });
  const list = users.data?.pages.flatMap((p) => p.content) ?? [];
  const total = users.data?.pages[0]?.totalElements ?? 0;

  const errors = form
    ? {
        name: !form.name.trim() ? 'Nome obrigatório.' : null,
        email: validateEmail(form.email),
        password: form.id
          ? form.password && form.password.trim().length < 6
            ? 'A nova senha precisa ter pelo menos 6 caracteres.'
            : null
          : form.password.trim().length < 6
            ? 'Senha obrigatória, com pelo menos 6 caracteres.'
            : null,
      }
    : { name: null, email: null, password: null };

  const save = useMutation({
    mutationFn: (f: Form) => {
      const body = { name: f.name.trim(), email: f.email.trim(), role: f.role };
      return f.id
        ? usersService.update(f.id, { ...body, password: f.password || undefined })
        : usersService.create({ ...body, password: f.password });
    },
    onSuccess: async (_, f) => {
      await invalidate.users(qc);
      toast.success(f.id ? 'Usuário atualizado.' : 'Usuário cadastrado.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: usersService.remove,
    onSuccess: async () => {
      await invalidate.users(qc);
      toast.success('Usuário excluído.');
      setForm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const open = (u?: UserResponse) => {
    setTouched(false);
    setForm(u ? { id: u.id, name: u.name, email: u.email, password: '', role: u.role } : { name: '', email: '', password: '', role: 'ROLE_USER' });
  };

  const submit = () => {
    setTouched(true);
    if (!form || errors.name || errors.email || errors.password) return;
    save.mutate(form);
  };

  const search = () => setFilters({ name: name.trim(), email: email.trim() });
  const isSelf = !!form?.id && form.id === me?.id;

  return (
    <Screen keyboard refreshing={users.isRefetching && !users.isFetchingNextPage} onRefresh={() => void users.refetch()}>
      <PageHeader
        back
        eyebrow="Cadastros"
        title="Usuários"
        description="Gerenciamento de contas do sistema."
        right={<GlassPill icon={Plus} label="Novo" onPress={() => open()} />}
      />

      <View style={styles.filters}>
        <Input placeholder="Filtrar por nome..." icon={UserRound} value={name} onChangeText={setName} returnKeyType="search" onSubmitEditing={search} accessibilityLabel="Filtrar por nome" />
        <Input
          placeholder="Filtrar por e-mail..."
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="search"
          onSubmitEditing={search}
          accessibilityLabel="Filtrar por e-mail"
        />
        <Button title="Buscar" variant="secondary" leftIcon={Search} icon={null} onPress={search} />
      </View>

      {users.isPending ? (
        <SkeletonList count={5} lines={1} />
      ) : users.isError ? (
        <ErrorState error={users.error} title="Erro ao carregar usuários." onRetry={() => void users.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado."
          actionLabel={filters.name || filters.email ? 'Limpar filtros' : undefined}
          onAction={() => {
            setName('');
            setEmail('');
            setFilters({ name: '', email: '' });
          }}
        />
      ) : (
        <View style={styles.list}>
          <Text variant="caption">
            Exibindo {list.length} de {total} usuários
          </Text>
          {list.map((u) => (
            <Card key={u.id} onPress={() => open(u)} accessibilityLabel={`${u.name}, ${u.email}, ${roleLabel[u.role]}. Editar`} style={styles.card}>
              <View style={styles.flex}>
                <Text variant="label">{u.name || '—'}</Text>
                <Text variant="caption" numberOfLines={1}>
                  {u.email}
                </Text>
              </View>
              <Badge label={roleTokens[u.role].label} tone={roleTokens[u.role]} />
            </Card>
          ))}
          {users.hasNextPage ? (
            <Button title="Carregar mais" variant="secondary" icon={null} loading={users.isFetchingNextPage} onPress={() => void users.fetchNextPage()} />
          ) : null}
        </View>
      )}

      <Sheet
        visible={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar usuário' : 'Cadastrar usuário'}
        description="Gestão de usuários"
        footer={
          <>
            <Button title={form?.id ? 'Salvar alterações' : 'Cadastrar usuário'} onPress={submit} loading={save.isPending} />
            {form?.id && !isSelf ? (
              <Button
                title="Excluir usuário"
                variant="danger"
                leftIcon={Trash2}
                icon={null}
                loading={remove.isPending}
                onPress={() => confirmDelete('Excluir usuário', 'Esta ação não pode ser desfeita.', () => form.id && remove.mutate(form.id))}
              />
            ) : null}
          </>
        }
      >
        {form ? (
          <>
            <Input label="Nome" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} maxLength={100} error={touched ? errors.name : null} />
            <Input
              label="E-mail"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              autoCapitalize="none"
              keyboardType="email-address"
              maxLength={150}
              error={touched ? errors.email : null}
            />
            <Input
              label={form.id ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
              password
              autoCapitalize="none"
              error={touched ? errors.password : null}
            />
            <Text variant="label">Perfil</Text>
            <View style={styles.wrap}>
              {ROLES.map((r) => (
                <Chip
                  key={r}
                  label={roleLabel[r]}
                  color={roleTokens[r].fg}
                  active={form.role === r}
                  onPress={() => !isSelf && setForm({ ...form, role: r })}
                />
              ))}
            </View>
            {isSelf ? <Text variant="caption">Esta é a sua conta: o perfil e a exclusão ficam bloqueados.</Text> : null}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: space.sm },
  list: { gap: space.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1, gap: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
