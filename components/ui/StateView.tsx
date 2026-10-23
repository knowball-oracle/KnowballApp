import type { LucideIcon } from 'lucide-react-native';
import { CircleAlert, Inbox, RefreshCw } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, size, space } from '@/theme/tokens';
import { errorMessage } from '@/utils/parseApiError';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon: Icon = Inbox, title, message, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="summary">
      <View style={styles.circle}>
        <Icon size={size.iconLg} color={colors.textSecondary} />
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="body" align="center">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" icon={null} block={false} style={styles.action} />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  error?: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Erro com "Tentar de novo". Usa a mensagem do parseApiError quando recebe `error`. */
export function ErrorState({ error, title = 'Não foi possível carregar', message, onRetry, retrying, style }: ErrorStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="alert">
      <View style={styles.circle}>
        <CircleAlert size={size.iconLg} color={colors.accent} />
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      <Text variant="body" align="center">
        {message ?? (error ? errorMessage(error) : 'Tente de novo em instantes.')}
      </Text>
      {onRetry ? (
        <Button
          title="Tentar de novo"
          onPress={onRetry}
          loading={retrying}
          variant="secondary"
          icon={RefreshCw}
          block={false}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl, paddingHorizontal: space.lg },
  circle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  action: { alignSelf: 'center', marginTop: space.sm },
});
