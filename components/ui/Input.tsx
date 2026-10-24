import type { LucideIcon } from 'lucide-react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextInputInstance, type TextInputProps, type ViewStyle } from 'react-native';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string | null;
  icon?: LucideIcon;
  /** Mostra "n / max" e limita o texto. */
  counter?: boolean;
  /** Campo de senha com botão de mostrar/ocultar. */
  password?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
}

export const Input = forwardRef<TextInputInstance, InputProps>(function Input(
  { label, hint, error, icon: Icon, counter, password, multiline, maxLength, value, containerStyle, inputStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const length = value?.length ?? 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          focused && styles.focused,
          !!error && styles.errored,
        ]}
      >
        {Icon ? <Icon size={size.iconSm} color={colors.textMuted} /> : null}
        <TextInput
          ref={ref}
          {...rest}
          value={value}
          multiline={multiline}
          maxLength={maxLength}
          secureTextEntry={password ? hidden : rest.secureTextEntry}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          accessibilityHint={error ?? hint}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
        />
        {password ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={space.md}
            style={styles.eye}
          >
            {hidden ? <Eye size={size.icon} color={colors.textMuted} /> : <EyeOff size={size.icon} color={colors.textMuted} />}
          </Pressable>
        ) : null}
      </View>
      {error || hint || counter ? (
        <View style={styles.footer}>
          <Text variant="caption" color={error ? colors.accent : colors.textMuted} style={styles.footerText}>
            {error ?? hint ?? ''}
          </Text>
          {counter && maxLength ? (
            <Text variant="caption">
              {length.toLocaleString('pt-BR')} / {maxLength.toLocaleString('pt-BR')}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: space.sm },
  field: {
    minHeight: size.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: ui.fill,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: space.md },
  focused: { borderColor: ui.focus },
  errored: { borderColor: colors.accent },
  input: {
    flex: 1,
    minHeight: size.input - 2,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  inputMultiline: { minHeight: 140, lineHeight: 22, paddingTop: 0 },
  eye: { padding: space.xs },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  footerText: { flex: 1 },
});
