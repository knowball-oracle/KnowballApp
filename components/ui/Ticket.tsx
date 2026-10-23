import { Ticket as TicketIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, size, space } from '@/theme/tokens';
import { barOpacity, barcodeBars } from '@/utils/barcode';
import { Text } from './Text';

export interface TicketProps {
  protocol: string;
  /** Linha de badges (status, resultado) abaixo do protocolo. */
  badges?: ReactNode;
  /** Conteúdo do meio (partida, árbitro). */
  children?: ReactNode;
  /** Texto do canhoto. */
  stubTitle?: string;
  stubText?: string;
  style?: StyleProp<ViewStyle>;
}

/** Comprovante com recorte de meia-lua nas laterais e código de barras do protocolo. */
export function Ticket({
  protocol,
  badges,
  children,
  stubTitle = 'Comprovante digital',
  stubText = 'Guarde este protocolo para acompanhar o andamento da denúncia.',
  style,
}: TicketProps) {
  const bars = barcodeBars(protocol);
  return (
    <View style={[styles.ticket, style]} accessibilityLabel={`Protocolo ${protocol}`}>
      <View style={styles.section}>
        <View style={styles.brand}>
          <TicketIcon size={size.iconSm} color={colors.textMuted} />
          <Text variant="eyebrow">Knowball · Protocolo de denúncia</Text>
        </View>
        <Text variant="monoLg" selectable>
          {protocol}
        </Text>
        {badges ? <View style={styles.badges}>{badges}</View> : null}
      </View>

      {children ? (
        <>
          <Divider />
          <View style={styles.section}>{children}</View>
        </>
      ) : null}

      <Divider />
      <View style={styles.section}>
        <Text variant="eyebrow">{stubTitle}</Text>
        <Text variant="caption">{stubText}</Text>
        <View style={styles.barcode} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {bars.map((w, i) => (
            <View key={i} style={{ width: w, height: size.barcode, backgroundColor: colors.textStrong, opacity: barOpacity(w) }} />
          ))}
        </View>
        <Text variant="mono" color={colors.textMuted} align="center">
          {protocol}
        </Text>
      </View>
    </View>
  );
}

/** Linha tracejada com os recortes de meia-lua. */
function Divider() {
  return (
    <View style={styles.divider}>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={styles.dash} />
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
}

const half = size.ticketNotch / 2;

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  section: { padding: space.xl, gap: space.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  divider: { height: size.ticketNotch, justifyContent: 'center' },
  dash: {
    marginHorizontal: half + space.sm,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  notch: {
    position: 'absolute',
    width: size.ticketNotch,
    height: size.ticketNotch,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notchLeft: { left: -half },
  notchRight: { right: -half },
  barcode: { flexDirection: 'row', justifyContent: 'center', gap: 1, marginTop: space.sm },
});
