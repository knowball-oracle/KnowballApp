import { router } from 'expo-router';
import { useState } from 'react';
import { Input } from '@/components/ui';
import { useRegister } from '@/features/register/RegisterContext';
import { RegisterStep } from '@/features/register/RegisterStep';
import { validateName } from '@/utils/validation';

export default function CadastroNome() {
  const { data, update } = useRegister();
  const [touched, setTouched] = useState(false);
  const error = validateName(data.name);

  const next = () => {
    setTouched(true);
    if (error) return;
    update({ name: data.name.trim() });
    router.push('/(auth)/cadastro/email');
  };

  return (
    <RegisterStep step={1} title="Como podemos te chamar?" description="Use o nome pelo qual sua equipe te conhece." onNext={next}>
      <Input
        label="Seu nome"
        placeholder="Ex.: Gabriel Rossi"
        value={data.name}
        onChangeText={(name) => update({ name })}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={next}
        maxLength={100}
        autoFocus
        error={touched ? error : null}
      />
    </RegisterStep>
  );
}
