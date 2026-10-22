import { router } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Input } from '@/components/ui';
import { useRegister } from '@/features/register/RegisterContext';
import { RegisterStep } from '@/features/register/RegisterStep';
import { validatePassword } from '@/utils/validation';

export default function CadastroSenha() {
  const { data, update } = useRegister();
  const confirmRef = useRef<TextInput>(null);
  const [touched, setTouched] = useState(false);
  const passwordError = validatePassword(data.password);
  const confirmError = !data.confirm
    ? 'Repita a senha para confirmar.'
    : data.confirm !== data.password
      ? 'As senhas não coincidem.'
      : null;

  const next = () => {
    setTouched(true);
    if (passwordError || confirmError) return;
    router.push('/(auth)/cadastro/codigo');
  };

  return (
    <RegisterStep step={3} title="Crie uma senha segura" description="Use no mínimo 6 caracteres." onNext={next}>
      <Input
        label="Sua senha"
        placeholder="••••••••"
        value={data.password}
        onChangeText={(password) => update({ password })}
        password
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        autoFocus
        error={touched ? passwordError : null}
      />
      <Input
        ref={confirmRef}
        label="Repetir senha"
        placeholder="••••••••"
        value={data.confirm}
        onChangeText={(confirm) => update({ confirm })}
        password
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={next}
        error={touched ? confirmError : null}
      />
    </RegisterStep>
  );
}
