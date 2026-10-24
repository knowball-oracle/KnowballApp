import { Image } from 'expo-image';
import { ArrowUp, RotateCcw } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, GlassPill, Text, useTabBarInset } from '@/components/ui';
import { CHAT_MAX_LENGTH } from '@/config';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { RichText } from './RichText';
import { KIKO_SUGGESTIONS, KIKO_WELCOME, useKikoChat, type ChatMessage } from './useKikoChat';

const kiko = require('@/assets/images/kiko.png');

function Dot({ delay }: { delay: number }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1));
  }, [delay, opacity, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

function Typing() {
  return (
    <View style={styles.typing} accessibilityLabel="Kiko está escrevendo">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}

function Bubble({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  const mine = message.role === 'user';
  return (
    <Animated.View
      entering={FadeInUp.duration(180)}
      style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}
      accessibilityLabel={`${mine ? 'Você' : 'Kiko'}: ${message.content}`}
    >
      {!mine ? <Image source={kiko} style={styles.avatarSm} accessibilityElementsHidden /> : null}
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs, message.error && styles.errored]}>
        {streaming && !message.content ? (
          <Typing />
        ) : mine ? (
          <Text variant="body" color={colors.onPrimary}>
            {message.content}
          </Text>
        ) : (
          <RichText text={message.content} color={message.error ? colors.textSecondary : colors.text} />
        )}
      </View>
    </Animated.View>
  );
}

/** Kiko: assistente com resposta em streaming (USER e ADMIN). */
export function KikoScreen() {
  const insets = useSafeAreaInsets();
  const tabInset = useTabBarInset();
  const { messages, streamingId, send, reset } = useKikoChat();
  const [text, setText] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const busy = !!streamingId;
  const canSend = !!text.trim() && !busy;

  const submit = (value = text) => {
    if (!value.trim() || busy) return;
    setText('');
    void send(value);
  };

  const confirmReset = () =>
    Alert.alert('Nova conversa', 'O histórico desta conversa será apagado deste aparelho.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: reset },
    ]);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Image source={kiko} style={styles.avatar} accessibilityLabel="Kiko" />
        <View style={styles.flex}>
          <Text variant="h2">Kiko</Text>
          <View style={styles.online}>
            <View style={styles.onlineDot} />
            <Text variant="caption">Assistente Knowball · online</Text>
          </View>
        </View>
        {messages.length ? <GlassPill icon={RotateCcw} onPress={confirmReset} accessibilityLabel="Nova conversa" /> : null}
      </View>

      <ScrollView
        ref={scroll}
        style={styles.flex}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        <Bubble message={{ id: 'welcome', role: 'assistant', content: KIKO_WELCOME }} streaming={false} />
        {messages.length === 0 ? (
          <View style={styles.suggestions}>
            {KIKO_SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} onPress={() => submit(s)} />
            ))}
          </View>
        ) : null}
        {messages.map((m) => (
          <Bubble key={m.id} message={m} streaming={m.id === streamingId} />
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: keyboardOpen ? space.sm : tabInset - space.md }]}>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Pergunte ao Kiko..."
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.accent}
            multiline
            maxLength={CHAT_MAX_LENGTH}
            editable={!busy}
            style={styles.input}
            accessibilityLabel="Mensagem para o Kiko"
          />
          <Pressable
            onPress={() => submit()}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            accessibilityState={{ disabled: !canSend }}
            style={[styles.send, !canSend && styles.sendDisabled]}
          >
            <ArrowUp size={size.icon} color={colors.onPrimary} strokeWidth={2.5} />
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text variant="caption" style={styles.flex}>
            Kiko pode cometer erros. Verifique informações importantes.
          </Text>
          {text.length > CHAT_MAX_LENGTH * 0.8 ? (
            <Text variant="caption">
              {text.length} / {CHAT_MAX_LENGTH}
            </Text>
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: radius.full },
  avatarSm: { width: 28, height: 28, borderRadius: radius.full, marginTop: 2 },
  online: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  onlineDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: ui.successFg },
  messages: { padding: space.lg, gap: space.md },
  row: { flexDirection: 'row', gap: space.sm, maxWidth: '88%' },
  rowMine: { alignSelf: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start' },
  bubble: { borderRadius: radius.lg, paddingHorizontal: space.md + 2, paddingVertical: space.sm + 2, flexShrink: 1 },
  mine: { backgroundColor: ui.white, borderBottomRightRadius: radius.sm },
  theirs: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: radius.sm },
  errored: { borderColor: ui.warnBorder },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingLeft: 36 },
  typing: { flexDirection: 'row', gap: space.xs, paddingVertical: space.sm },
  dot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.textSecondary },
  composer: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    backgroundColor: ui.fill,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingLeft: space.lg,
    padding: space.xs,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingTop: space.sm + 2,
    paddingBottom: space.sm + 2,
  },
  send: {
    width: size.touch,
    height: size.touch,
    borderRadius: radius.full,
    backgroundColor: ui.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  footer: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.xs },
});
