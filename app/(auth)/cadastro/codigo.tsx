import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Input, Notice, Text, useToast } from '@/components/ui';
import { RESEND_SECONDS, useRegister } from '@/features/register/RegisterContext';
import { RegisterStep } from '@/features/register/RegisterStep';
import { authService } from '@/services/auth';
import { useSession } from '@/session/SessionProvider';
import { colors, space } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { isApiError, parseApiError } from '@/utils/parseApiError';
import { validateCode, validateEmail, validateName, validatePassword } from '@/utils/validation';

export default function CadastroCodigo() {
  const { data, codeSent, setCodeSent } = useRegister();
  const { signIn } = useSession();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const valid = !validateName(data.name) && !validateEmail(data.email) && !validatePassword(data.password);
  const sentForThisEmail = codeSent?.email === data.email;
  const secondsLeft =
    codeSent && sentForThisEmail ? Math.max(0, RESEND_SECONDS - Math.floor((now - codeSent.at) / 1000)) : 0;

  const send = useMutation({
    mutationFn: () => authService.sendCode(data.email),
    onMutate: () => setError(null),
    onSuccess: () => setCodeSent({ email: data.email, at: Date.now() }),
    onError: (e) => setError(parseApiError(e).message || 'Não foi possível enviar o código. Tente reenviar.'),
  });
  const sendCode = send.mutate;

  // Envia o código ao entrar na etapa (uma vez por e-mail; voltar e avançar não reenvia).
  useEffect(() => {
    if (valid && !sentForThisEmail && !send.isPending && !send.isError) sendCode();
  }, [valid, sentForThisEmail, send.isPending, send.isError, sendCode]);

  useEffect(() => {
    if (!secondsLeft) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const resend = useCallback(() => {
    setCode('');
    setCodeSent(null);
    send.reset();
    sendCode();
  }, [send, sendCode, setCodeSent]);

  const finish = useMutation({
    mutationFn: async (value: string) => {
      try {
        await authService.confirmCode(data.email, value);
      } catch (e) {
        const err = parseApiError(e);
        throw new Error(err.kind === 'validation' ? err.message : 'Código inválido ou expirado. Tente novamente ou reenvie.');
      }
      return authService.register({ name: data.name, email: data.email, password: data.password });
    },
    onMutate: () => setError(null),
    onSuccess: async (res) => {
      await signIn(res);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success(`Conta criada. Bem-vindo ao Knowball, ${res.name.split(' ')[0]}!`);
      // O guarda do grupo (auth) leva para o início do perfil.
    },
    onError: (e) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Erro do código (lançado acima como Error simples).
      if (!isApiError(e)) {
        setError(e instanceof Error ? e.message : 'Código inválido ou expirado. Tente novamente ou reenvie.');
        return;
      }
      // Erro do POST /auth/register.
      if (/verifica/i.test(e.message)) {
        setError(e.message || 'Verificação expirada. Solicite um novo código.');
        resend();
        return;
      }
      if (e.kind === 'conflict') {
        toast.error('Este e-mail já tem uma conta. Entre ou use outro e-mail.');
        router.dismissTo('/(auth)/cadastro/email');
        return;
      }
      setError(e.message || 'Erro ao cadastrar. Tente novamente.');
    },
  });

  const submit = (value = code) => {
    setTouched(true);
    if (validateCode(value) || finish.isPending) return;
    finish.mutate(value);
  };

  if (!valid) return <Redirect href="/(auth)/cadastro/nome" />;

  return (
    <RegisterStep
      step={4}
      title="Confirme seu e-mail"
      description={
        <Text variant="body">
          Enviamos um código de 6 dígitos para <Text variant="label">{data.email}</Text>. Ele vale por 10 minutos.
        </Text>
      }
      actionTitle={finish.isPending ? 'Criando conta...' : 'Criar conta'}
      onNext={() => submit()}
      loading={finish.isPending}
    >
      {error ? <Notice tone="error">{error}</Notice> : null}

      <Input
        label="Código de verificação"
        placeholder="000000"
        value={code}
        onChangeText={(v) => {
          const digits = v.replace(/\D/g, '').slice(0, 6);
          setCode(digits);
          if (digits.length === 6) submit(digits);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        maxLength={6}
        autoFocus
        inputStyle={styles.code}
        error={touched ? validateCode(code) : null}
        accessibilityHint="Digite os 6 números enviados para o seu e-mail"
      />

      <View style={styles.resend}>
        {send.isPending ? (
          <Text variant="caption">Enviando código de verificação...</Text>
        ) : (
          <>
            <Text variant="caption">Não recebeu o código?</Text>
            {secondsLeft > 0 ? (
              <Text variant="caption" accessibilityLiveRegion="polite">
                Reenviar em {secondsLeft}s
              </Text>
            ) : (
              <Pressable onPress={resend} accessibilityRole="button" hitSlop={space.md} style={styles.resendButton}>
                <Text variant="label" color={colors.accent}>
                  Reenviar código
                </Text>
              </Pressable>
            )}
          </>
        )}
      </View>
      <Text variant="caption">Confira também a caixa de spam.</Text>
    </RegisterStep>
  );
}

const styles = StyleSheet.create({
  code: { ...typography.monoLg, textAlign: 'center', letterSpacing: 10 },
  resend: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap', minHeight: 44 },
  resendButton: { minHeight: 44, justifyContent: 'center' },
});
