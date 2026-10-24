import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ExternalLink } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type TextInputInstance } from 'react-native';
import { Button, Card, Input, Notice, PageHeader, Screen, Text } from '@/components/ui';
import { WEB_URL } from '@/config';
import { authService } from '@/services/auth';
import { useSession } from '@/session/SessionProvider';
import { colors, space } from '@/theme/tokens';
import { parseApiError } from '@/utils/parseApiError';
import { validateEmail } from '@/utils/validation';

const logo = require('@/assets/images/logo.svg');

/** Mensagem do login por tipo de erro. */
function loginErrorMessage(e: unknown): string {
  const err = parseApiError(e);
  switch (err.kind) {
    case 'unauthorized':
      return 'E-mail ou senha inválidos.';
    case 'network':
      return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';
    case 'timeout':
      return 'O servidor está demorando para responder (ele pode estar acordando). Tente de novo em instantes.';
    case 'validation':
      return err.message;
    default:
      return 'Não foi possível entrar agora. Tente de novo em instantes.';
  }
}

export default function Login() {
  const { signIn } = useSession();
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const emailError = validateEmail(email);
  const passwordError = password.length < 6 ? 'Senha é obrigatória e deve ter pelo menos 6 caracteres.' : null;

  const login = useMutation({
    mutationFn: () => authService.login({ email: email.trim(), password }),
    onSuccess: async (res) => {
      await signIn(res);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // O guarda do grupo (auth) redireciona para a casa do perfil.
    },
    onError: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  });

  const submit = () => {
    setTouched(true);
    if (emailError || passwordError || login.isPending) return;
    login.mutate();
  };

  return (
    <Screen keyboard>
      <PageHeader
        back
        right={<Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel="Knowball" />}
        title="Entre na sua conta"
        description="Acesse denúncias, campeonatos e relatórios do Knowball."
      />

      {login.isError ? <Notice tone="error">{loginErrorMessage(login.error)}</Notice> : null}

      <View style={styles.form}>
        <Input
          label="Seu e-mail"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={touched ? emailError : null}
        />
        <Input
          ref={passwordRef}
          label="Sua senha"
          placeholder="Digite sua senha"
          hint="Mínimo de 6 caracteres"
          value={password}
          onChangeText={setPassword}
          password
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={touched ? passwordError : null}
        />
        <Button title={login.isPending ? 'Entrando...' : 'Entrar na minha conta'} loading={login.isPending} onPress={submit} />
      </View>

      <Pressable
        onPress={() => router.replace('/(auth)/cadastro/nome')}
        accessibilityRole="link"
        style={styles.signup}
        hitSlop={space.sm}
      >
        <Text variant="body" align="center">
          Ainda não tem conta? <Text variant="label" color={colors.accent}>Criar conta</Text>
        </Text>
      </Pressable>

      <Card style={styles.google}>
        <Text variant="label">Criou sua conta com o Google?</Text>
        <Text variant="caption">
          O login com Google funciona só no site do Knowball. No app, entre com e-mail e senha.
        </Text>
        <Button
          title="Entrar pelo site"
          variant="secondary"
          icon={ExternalLink}
          onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/auth/login`)}
          accessibilityHint="Abre o site do Knowball no navegador"
        />
      </Card>

      <Notice tone="lock">
        Seus dados são tratados com confidencialidade. Ao entrar, você poderá acompanhar denúncias, campeonatos e
        relatórios do Knowball.
      </Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { width: 123, height: 33 },
  form: { gap: space.lg },
  signup: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  google: { gap: space.sm },
});
