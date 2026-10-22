import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Button, ProgressHeader, Screen, Text } from '@/components/ui';
import { colors, space } from '@/theme/tokens';
import { REGISTER_STEPS } from './RegisterContext';

const LABELS = ['Nome', 'E-mail', 'Senha', 'Verificação'];

export interface RegisterStepProps {
  step: number;
  title: string;
  description: ReactNode;
  children: ReactNode;
  actionTitle?: string;
  onNext: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Moldura de cada etapa do cadastro: progresso, título, campos e botão fixo no rodapé. */
export function RegisterStep({ step, title, description, children, actionTitle = 'Continuar', onNext, loading, disabled }: RegisterStepProps) {
  return (
    <Screen
      keyboard
      footer={
        <>
          <Button title={actionTitle} onPress={onNext} loading={loading} disabled={disabled} />
          {step === 1 ? (
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              accessibilityRole="link"
              style={styles.login}
              hitSlop={space.sm}
            >
              <Text variant="caption" align="center">
                Já possui uma conta? <Text variant="caption" color={colors.accent}>Entrar</Text>
              </Text>
            </Pressable>
          ) : null}
        </>
      }
    >
      <ProgressHeader step={step} total={REGISTER_STEPS} stepLabel={LABELS[step - 1]} title={title} back />
      {typeof description === 'string' ? <Text variant="body">{description}</Text> : description}
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  login: { minHeight: 44, justifyContent: 'center' },
});
