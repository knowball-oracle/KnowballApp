import { Alert } from 'react-native';

/** Alert nativo só para confirmar exclusões (DESIGN.md). */
export function confirmDelete(title: string, message: string, onConfirm: () => void, confirmLabel = 'Excluir') {
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
