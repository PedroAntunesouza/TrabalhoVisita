import { useRef, useState } from 'react';
import { View, Button, Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Button title="Permitir câmera" onPress={requestPermission} />
      </View>
    );
  }

  const tirarFoto = async () => {
    if (cameraRef.current) {
      const result = await (cameraRef.current as any).takePictureAsync();
      setPhoto(result.uri); //  salva o caminho da imagem
    }
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <>
          <Image source={{ uri: photo }} style={styles.image} />
          <Button title="Tirar outra foto" onPress={() => setPhoto(null)} />
        </>
      ) : (
        <>
          <CameraView ref={cameraRef} style={styles.camera} />
          <Button title="Tirar foto" onPress={tirarFoto} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  image: { flex: 1 },
});