import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import api from "@/service/api";
import { useAuth } from '../../context/auth-context';

interface Visita {
  id?: number;
  localName: string;
  observation: string;
  latitude: number;
  longitude: number;
  uriImagem: string;
  userEmail?: string;
}

const STORAGE_KEY = '@visitas';

export default function CadastroVisitaScreen() {
  const { email } = useAuth();

  const [visitas, setVisitas] = useState<Visita[]>([]);

  const [nomeLocal, setNomeLocal] = useState('');
  const [observacao, setObservacao] = useState('');

  const [latitude, setLatitude] = useState(-23.55052);
  const [longitude, setLongitude] = useState(-46.633308);

  const [imagem, setImagem] = useState<string | null>(null);

  const [mapaVisivel, setMapaVisivel] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  const [isCameraActive, setIsCameraActive] = useState(false);

  const cameraRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        try {
          const dados = await AsyncStorage.getItem(STORAGE_KEY);

          if (dados) {
            setVisitas(JSON.parse(dados));
          }
        } catch {
          Alert.alert('Erro', 'Falha ao carregar visitas');
        }
      }

      carregar();
    }, [])
  );

  async function abrirCamera() {
    if (!permission) {
      await requestPermission();
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();

      if (!granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à câmera.'
        );

        return;
      }
    }

    setIsCameraActive(true);
  }

  async function capturarFoto() {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();

      setImagem(result.uri);

      setIsCameraActive(false);
    }
  }

  async function adicionarVisita() {
    if (!nomeLocal.trim()) {
      Alert.alert('Erro', 'Preencha o nome do local');

      return;
    }

    if (!imagem) {
      Alert.alert('Erro', 'Tire uma foto');

      return;
    }

    const novaVisita: Visita = {
      localName: nomeLocal,
      observation: observacao,
      latitude: latitude,
      longitude: longitude,
      uriImagem: imagem,
    };

    try {
      
      const response = await api.post(`/visit/create?email=${email}`, novaVisita);

      console.log('Resposta API:', response.data);

      // SALVA LOCALMENTE
      const dados = await AsyncStorage.getItem(STORAGE_KEY);

      const listaAtual: Visita[] = dados
        ? JSON.parse(dados)
        : [];

      const novaLista = [...listaAtual, response.data];

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(novaLista)
      );

      setVisitas(novaLista);

      // LIMPA CAMPOS
      setNomeLocal('');
      setObservacao('');
      setImagem(null);

      Alert.alert('Sucesso', 'Visita cadastrada!');
    } catch (error) {
      console.log(error);

      Alert.alert('Erro', 'Falha ao cadastrar visita');
    }
  }

  async function removerVisita(id: number) {
    const novaLista = visitas.filter(
      (item) => item.id !== id
    );

    setVisitas(novaLista);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(novaLista)
    );
  }

  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
        />

        <View style={styles.cameraButtonsContainer}>
          <Button
            title="TIRAR FOTO"
            onPress={capturarFoto}
          />
        </View>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: '#D0D0D0',
        dark: '#353636',
      }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{ fontFamily: Fonts.rounded }}
        >
          Olá {email}
        </ThemedText>
      </ThemedView>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'android'
            ? 'padding'
            : undefined
        }
        keyboardVerticalOffset={100}
      >
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>
            Cadastrar Visita
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Nome do local"
            value={nomeLocal}
            onChangeText={setNomeLocal}
          />

          <TextInput
            style={styles.input}
            placeholder="Observação"
            value={observacao}
            onChangeText={setObservacao}
          />

          <View style={styles.rowButtons}>
            <Pressable
              style={[
                styles.imageButton,
                { flex: 1, marginRight: 5 },
              ]}
              onPress={abrirCamera}
            >
              <ThemedText style={styles.imageButtonText}>
                Tirar Foto
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.imageButton,
                {
                  flex: 1,
                  marginLeft: 5,
                  backgroundColor: '#4CAF50',
                },
              ]}
              onPress={() => setMapaVisivel(true)}
            >
              <ThemedText style={styles.imageButtonText}>
                Ver Mapa
              </ThemedText>
            </Pressable>
          </View>

          {imagem && (
            <Image
              source={{ uri: imagem }}
              style={styles.previewImage}
            />
          )}

          <Button
            title="Cadastrar Visita"
            onPress={adicionarVisita}
          />
        </ThemedView>
      </KeyboardAvoidingView>

      {visitas.length > 0 && (
        <ThemedView style={styles.visitasContainer}>
          <ThemedText style={styles.visitasTitle}>
            Visitas Cadastradas
          </ThemedText>

          <FlatList
            data={visitas}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            renderItem={({ item }) => (
              <ThemedView style={styles.visitaCard}>
                {item.uriImagem && (
                  <Image
                    source={{ uri: item.uriImagem }}
                    style={styles.cardImage}
                  />
                )}

                <ThemedText style={styles.textCard}>
                  Local: {item.localName}
                </ThemedText>

                <ThemedText style={styles.textCard}>
                  Observação:{' '}
                  {item.observation || 'Nenhuma'}
                </ThemedText>

                <ThemedText style={styles.textCard}>
                  Usuário: {item.userEmail || 'Desconhecido'}
                </ThemedText>

                <Pressable
                  onPress={() =>
                    item.id && removerVisita(item.id)
                  }
                >
                  <ThemedText
                    style={{
                      color: 'red',
                      marginTop: 6,
                    }}
                  >
                    Excluir
                  </ThemedText>
                </Pressable>
              </ThemedView>
            )}
          />
        </ThemedView>
      )}

      <Modal
        visible={mapaVisivel}
        animationType="slide"
        transparent={false}
      >
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: -23.55052,
              longitude: -46.633308,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />

          <View style={styles.mapCloseButton}>
            <Button
              title="Fechar Mapa"
              onPress={() => setMapaVisivel(false)}
            />
          </View>
        </View>
      </Modal>

      <View style={{ height: 80 }} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    position: 'absolute',
    bottom: -90,
    left: -35,
  },

  titleContainer: {
    marginBottom: 20,
  },

  formContainer: {
    padding: 16,
    borderRadius: 8,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: Fonts.rounded,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },

  imageButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },

  imageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },

  visitasContainer: {
    padding: 16,
  },

  visitasTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: Fonts.rounded,
  },

  visitaCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginBottom: 8,
  },

  textCard: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  cameraContainer: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  cameraButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },

  mapCloseButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 5,
  },
});