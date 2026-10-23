import { Redirect, router } from 'expo-router';
import { Check, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Button, Card, Chip, Input, Notice, ProgressHeader, Screen, Text } from '@/components/ui';
import { REPORT_MAX_LENGTH, REPORT_MIN_LENGTH } from '@/config';
import { REPORT_SNIPPETS, REPORT_TIPS } from '@/features/reports/copy';
import { useReportDraft } from '@/features/reports/DraftContext';
import { colors, motion, radius, size, space, ui } from '@/theme/tokens';

const SNIPPETS = REPORT_SNIPPETS;
const TIPS = REPORT_TIPS;

export default function PassoRelato() {
  const { draft, update, ready } = useReportDraft();
  const [touched, setTouched] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(true);
  const length = draft.content.trim().length;
  const valid = length >= REPORT_MIN_LENGTH;
  const progress = Math.min(1, length / REPORT_MIN_LENGTH);

  const bar = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: motion.enter }),
    backgroundColor: valid ? ui.successFg : ui.warnFg,
  }));

  if (ready && !draft.refereeId) return <Redirect href="/(user)/nova-denuncia/arbitro" />;

  const addSnippet = (text: string) => {
    if (draft.content.includes(text.trim())) return;
    const sep = draft.content && !draft.content.endsWith('\n') ? '\n' : '';
    const next = `${draft.content}${sep}${text}`;
    if (next.length <= REPORT_MAX_LENGTH) update({ content: next });
  };

  return (
    <Screen
      keyboard
      footer={
        <Button
          title="Revisar denúncia"
          onPress={() => {
            setTouched(true);
            if (valid) router.push('/(user)/nova-denuncia/revisao');
          }}
        />
      }
    >
      <ProgressHeader step={3} total={3} stepLabel="Relato" title="Descreva o ocorrido" back />
      <Text variant="body">Conte com o máximo de detalhes o que você viu em campo.</Text>

      <View style={styles.snippets}>
        {SNIPPETS.map((s) => {
          const used = draft.content.includes(s.text.trim());
          return (
            <Chip
              key={s.label}
              label={`${used ? '✓' : '+'} ${s.label}`}
              active={used}
              onPress={() => addSnippet(s.text)}
            />
          );
        })}
      </View>

      <View style={styles.field}>
        <Input
          label="Relato"
          multiline
          counter
          maxLength={REPORT_MAX_LENGTH}
          value={draft.content}
          onChangeText={(content) => update({ content })}
          placeholder={`Descreva o ocorrido detalhadamente (mín. ${REPORT_MIN_LENGTH} caracteres)...`}
          error={touched && !valid ? `Relato obrigatório (mínimo ${REPORT_MIN_LENGTH} caracteres).` : null}
          inputStyle={styles.textarea}
        />
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityLabel={valid ? 'Mínimo de caracteres atingido' : `Faltam ${REPORT_MIN_LENGTH - length} caracteres para o mínimo`}
        >
          <Animated.View style={[styles.fill, bar]} />
        </View>
        {!valid ? (
          <Text variant="caption" color={ui.warnFg}>
            Faltam {REPORT_MIN_LENGTH - length} caracteres para o mínimo.
          </Text>
        ) : null}
      </View>

      <Card style={styles.tips}>
        <Pressable
          onPress={() => setTipsOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityState={{ expanded: tipsOpen }}
          style={styles.tipsHeader}
        >
          <Lightbulb size={size.icon} color={ui.warnFg} />
          <Text variant="label" style={styles.flex}>
            Dicas para um bom relato
          </Text>
          {tipsOpen ? <ChevronUp size={size.icon} color={colors.textMuted} /> : <ChevronDown size={size.icon} color={colors.textMuted} />}
        </Pressable>
        {tipsOpen
          ? TIPS.map((tip) => (
              <View key={tip} style={styles.tip}>
                <Check size={size.iconSm} color={colors.textMuted} />
                <Text variant="caption" style={styles.flex} color={colors.textSecondary}>
                  {tip}
                </Text>
              </View>
            ))
          : null}
      </Card>

      <Notice tone="lock" title="Confidencialidade garantida.">
        Suas informações são usadas apenas na análise desta denúncia. Você receberá o protocolo por e-mail.
      </Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  snippets: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  field: { gap: space.sm },
  textarea: { minHeight: 180 },
  track: { height: size.progress, borderRadius: radius.full, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
  tips: { gap: space.md },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: size.touch },
  tip: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  flex: { flex: 1 },
});
