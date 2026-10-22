import { router } from 'expo-router';
import { useState } from 'react';
import { Input } from '@/components/ui';
import { useRegister } from '@/features/register/RegisterContext';
import { RegisterStep } from '@/features/register/RegisterStep';
import { validateEmail } from '@/utils/validation';

export default function CadastroEmail() {
  const { data, update } = useRegister();
  const [touched, setTouched] = useState(false);
  const error = validateEmail(data.email);

  const next = () => {
    setTouched(true);
    if (error) return;
    update({ email: data.email.trim() });
    router.push('/(auth)/cadastro/senha');
  };

  return (
    <RegisterStep
      step={2}
      title="Qual é o seu e-mail?"
      description="Enviaremos um código de verificação para confirmar que ele é seu."
      onNext={next}
    >
      <Input
        label="Seu e-mail"
        placeholder="seu@email.com"
        value={data.email}
        onChangeText={(email) => update({ email })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={next}
        maxLength={150}
        autoFocus
        error={touched ? error : null}
      />
    </RegisterStep>
  );
}
