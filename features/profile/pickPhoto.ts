import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type PickPhotoResult = { status: 'ok'; dataUrl: string } | { status: 'cancelled' } | { status: 'denied' };

/**
 * Escolhe uma foto da galeria, recorta em quadrado e reduz para 400 px em JPEG 0,75
 * (igual ao `_compressImage` do web), devolvendo um data URL Base64 para PUT /users/me.
 */
export async function pickProfilePhoto(): Promise<PickPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (picked.canceled || !picked.assets[0]) return { status: 'cancelled' };

  const asset = picked.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if ((asset.width ?? 0) > 400 || (asset.height ?? 0) > 400) {
    context.resize(asset.width >= asset.height ? { width: 400 } : { height: 400 });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
  if (!result.base64) throw new Error('Não foi possível processar a foto.');
  return { status: 'ok', dataUrl: `data:image/jpeg;base64,${result.base64}` };
}
