import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Button,
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
import * as Location from 'expo-location';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

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
  user?: {
    email?: string;
  };
}

interface Coordenadas {
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = '@visitas';

export default function CadastroVisitaScreen() {
  const { email } = useAuth();

  const [visitas, setVisitas] = useState<Visita[]>([]);

  const [nomeLocal, setNomeLocal] = useState('');
  const [observacao, setObservacao] = useState('');

  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [marcadorTemp, setMarcadorTemp] = useState<Coordenadas | null>(null);
  const [regiaoInicial, setRegiaoInicial] = useState({
    latitude: -15.7801,
    longitude: -47.9292,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  const [imagem, setImagem] = useState<string | null>(null);

  const [mapaVisivel, setMapaVisivel] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  const [isCameraActive, setIsCameraActive] = useState(false);

  const cameraRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        if (!email) {
          setVisitas([]);
          return;
        }

        try {
          const response = await api.get('/visit/list', {
            params: { email },
          });

          const visitasCarregadas = response.data || [];
          setVisitas(visitasCarregadas);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(visitasCarregadas));
        } catch (error: any) {
          console.log('Erro ao carregar visitas:', error.response?.data || error.message || error);

          try {
            const dados = await AsyncStorage.getItem(STORAGE_KEY);
            if (dados) {
              setVisitas(JSON.parse(dados));
              return;
            }
          } catch (storageError) {
            console.log('Erro ao carregar visitas do cache:', storageError);
          }

          Alert.alert('Erro', 'Falha ao carregar visitas');
          setVisitas([]);
        }
      }

      carregar();
    }, [email])
  );

  async function abrirMapa() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setRegiaoInicial({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch {
      // Falha ao obter localização
    }
    setMarcadorTemp(coordenadas);
    setMapaVisivel(true);
  }

  function selecionarLocalNoMapa(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarcadorTemp({ latitude, longitude });
  }

  function confirmarLocalizacao() {
    if (!marcadorTemp) {
      Alert.alert('Atenção', 'Toque no mapa para marcar o local');
      return;
    }
    setCoordenadas(marcadorTemp);
    setMapaVisivel(false);
  }

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

    if (!coordenadas) {
      Alert.alert('Erro', 'Marque a localização no mapa');
      return;
    }

    const novaVisita: Visita = {
      localName: nomeLocal,
      observation: observacao,
      latitude: coordenadas.latitude,
      longitude: coordenadas.longitude,
      uriImagem: imagem,
    };

    if (!email) {
      Alert.alert('Erro', 'Email do usuário não encontrado. Faça login novamente.');
      return;
    }

    try {
      const response = await api.post('/visit/create', novaVisita, {
        params: { email },
      });

      const novasVisitas = [...visitas, response.data];
      setVisitas(novasVisitas);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novasVisitas));

      // LIMPA CAMPOS
      setNomeLocal('');
      setObservacao('');
      setImagem(null);
      setCoordenadas(null);
      setMarcadorTemp(null);

      Alert.alert('Sucesso', 'Visita cadastrada!');
    } catch (error: any) {
      console.log('Erro ao cadastrar visita:', error.response?.data || error.message || error);
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

        <Pressable 
          style={styles.cameraBackButton} 
          onPress={() => setIsCameraActive(false)}
        >
          <IconSymbol name="chevron.left" size={32} color="#fff" />
        </Pressable>

        <View style={styles.cameraButtonsContainer}>
          <Pressable style={styles.cameraCaptureButton} onPress={capturarFoto}>
            <IconSymbol name="camera.fill" size={36} color="#000" />
          </Pressable>
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
              onPress={abrirMapa}
            >
              <ThemedText style={styles.imageButtonText}>
                Ver Mapa
              </ThemedText>
            </Pressable>
          </View>

          {imagem && (
            <ThemedView style={styles.cardPrevia}>
              <ThemedText style={styles.cardPreviaTitulo}>Foto capturada</ThemedText>
              <Image
                source={{ uri: imagem }}
                style={styles.previewImage}
              />
            </ThemedView>
          )}

          {coordenadas && (
            <ThemedView style={styles.cardPrevia}>
              <ThemedText style={styles.cardPreviaTitulo}>Local marcado</ThemedText>
              <ThemedText style={{ color: 'gray' }}>
                Latitude: {coordenadas.latitude.toFixed(6)}
              </ThemedText>
              <ThemedText style={{ color: 'gray' }}>
                Longitude: {coordenadas.longitude.toFixed(6)}
              </ThemedText>
            </ThemedView>
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

          {visitas.map((item, index) => (
            <ThemedView
              key={item.id?.toString() || index.toString()}
              style={styles.visitaCard}
            >
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
                Usuário: {item.userEmail || item.user?.email || 'Desconhecido'}
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
          ))}
        </ThemedView>
      )}

      <Modal
        visible={mapaVisivel}
        animationType="slide"
        transparent={false}
      >
        <View style={{ flex: 1 }}>
          {marcadorTemp && (
            <View style={styles.coordsFloatingBox}>
              <ThemedText style={{ fontWeight: 'bold', color: '#fff' }}>Local Selecionado</ThemedText>
              <ThemedText style={{ color: '#fff' }}>Lat: {marcadorTemp.latitude.toFixed(5)}</ThemedText>
              <ThemedText style={{ color: '#fff' }}>Lng: {marcadorTemp.longitude.toFixed(5)}</ThemedText>
            </View>
          )}

          <MapView
            style={{ flex: 1 }}
            initialRegion={regiaoInicial}
            onPress={selecionarLocalNoMapa}
          >
            {marcadorTemp && <Marker coordinate={marcadorTemp} />}
          </MapView>

          <View style={styles.mapActionsContainer}>
            <Pressable
              style={[styles.mapActionButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => setMapaVisivel(false)}
            >
              <ThemedText style={styles.mapActionText}>Cancelar</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.mapActionButton, { backgroundColor: '#34C759' }]}
              onPress={confirmarLocalizacao}
            >
              <ThemedText style={styles.mapActionText}>Confirmar Local</ThemedText>
            </Pressable>
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

  cardPrevia: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    marginBottom: 10,
  },

  cardPreviaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  coordsFloatingBox: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  mapActionsContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },

  mapActionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  mapActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    justifyContent: 'center',
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
  },

  cameraBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  cameraButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 10,
  },

  cameraCaptureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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