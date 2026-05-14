import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
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
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

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
  date: string;
  userEmail?: string;

}

interface Coordenadas {
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = '@visitas';

export default function CadastroVisitaScreen() {
  const { email, name } = useAuth();

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

  async function abrirMapa() {
    // Tenta centralizar o mapa na localização atual do usuário
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
      // Sem permissão: mantém região padrão (Brasil)
    }

    setMarcadorTemp(coordenadas); // reabre com o marcador existente se houver
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
        Alert.alert('Permissão necessária', 'Permita o acesso à câmera.');
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
      Alert.alert('Erro', 'Tire uma foto do local');
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
      date: new Date().toISOString(),
    };

    try {
    
      const response = await api.post(`/visit/create?email=${email}`, novaVisita);

      console.log('Resposta API:', response.data);

      // SALVA LOCALMENTE
      const dados = await AsyncStorage.getItem(STORAGE_KEY);
      const listaAtual: Visita[] = dados ? JSON.parse(dados) : [];
      const novaLista = [...listaAtual, response.data];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));

      setVisitas(novaLista);

      // LIMPA CAMPOS
      setNomeLocal('');
      setObservacao('');
      setImagem(null);
      setCoordenadas(null);

      Alert.alert('Sucesso', 'Visita cadastrada!');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Falha ao cadastrar visita');
    }
  }

  async function removerVisita(id: number) {
    Alert.alert(
      'Excluir visita',
      'Tem certeza que deseja excluir esta visita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const novaLista = visitas.filter((item) => item.id !== id);
            setVisitas(novaLista);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
          },
        },
      ]
    );
  }

  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} />

        {/* Botão voltar */}
        <Pressable
          style={styles.cameraVoltarButton}
          onPress={() => setIsCameraActive(false)}
        >
          <ThemedText style={styles.cameraVoltarIcon}>‹</ThemedText>
        </Pressable>

        {/* Botão redondo de tirar foto */}
        <View style={styles.cameraButtonsContainer}>
          <Pressable style={styles.capturaButton} onPress={capturarFoto}>
            <View style={styles.capturaButtonInner} />
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
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Olá, {name || email}
        </ThemedText>
      </ThemedView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>Cadastrar Visita</ThemedText>

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

          <View style={styles.botoesLinhaContainer}>
            <Pressable
              style={[styles.imageButton, { flex: 1, marginRight: 5 }]}
              onPress={abrirCamera}
            >
              <ThemedText style={styles.imageButtonText}>Tirar Foto</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.imageButton, { flex: 1, marginLeft: 5, backgroundColor: '#4CAF50' }]}
              onPress={abrirMapa}
            >
              <ThemedText style={styles.imageButtonText}>Marcar Local</ThemedText>
            </Pressable>
          </View>

          {/* Card da foto */}
          {imagem && (
            <ThemedView style={styles.cardPrevia}>
              <ThemedText style={styles.cardPreviaTitulo}>Foto capturada</ThemedText>
              <Image source={{ uri: imagem }} style={styles.previaImagem} />
            </ThemedView>
          )}

          {/* Card das coordenadas */}
          {coordenadas && (
            <ThemedView style={styles.cardPrevia}>
              <ThemedText style={styles.cardPreviaTitulo}>Local marcado</ThemedText>
              <ThemedText style={styles.coordenadasTexto}>
                Latitude: {coordenadas.latitude.toFixed(6)}
              </ThemedText>
              <ThemedText style={styles.coordenadasTexto}>
                Longitude: {coordenadas.longitude.toFixed(6)}
              </ThemedText>
            </ThemedView>
          )}

          <Button title="Cadastrar Visita" onPress={adicionarVisita} />
        </ThemedView>
      </KeyboardAvoidingView>

      {visitas.length > 0 && (
        <ThemedView style={styles.visitasContainer}>
          <ThemedText style={styles.visitasTitulo}>Visitas Cadastradas</ThemedText>

          <FlatList
            data={visitas}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
                  Observação: {item.observation || 'Nenhuma'}
                </ThemedText>

                {item.latitude != null && item.longitude != null && (
                  <ThemedText style={styles.textCard}>
                    Coordenadas: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                  </ThemedText>
                )}

                <Pressable onPress={() => item.id && removerVisita(item.id)}>
                  <ThemedText style={{ color: 'red', marginTop: 6 }}>
                <ThemedText style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                  Cadastrado por: {item.userEmail || 'Desconhecido'}
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

      {/* Modal do mapa para seleção de localização */}
      <Modal visible={mapaVisivel} animationType="slide" transparent={false}>
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={regiaoInicial}
            onPress={selecionarLocalNoMapa}
          >
            {marcadorTemp && (
              <Marker coordinate={marcadorTemp} title="Local selecionado" />
            )}
          </MapView>

          {/* Instrução */}
          <View style={styles.mapaInstrucaoContainer}>
            <ThemedText style={styles.mapaInstrucaoTexto}>
              {marcadorTemp
                ? `📍 ${marcadorTemp.latitude.toFixed(5)}, ${marcadorTemp.longitude.toFixed(5)}`
                : 'Toque no mapa para marcar o local'}
            </ThemedText>
          </View>

          {/* Botões do mapa */}
          <View style={styles.mapaBotoesContainer}>
            <Pressable
              style={[styles.mapaBotao, { backgroundColor: '#999' }]}
              onPress={() => setMapaVisivel(false)}
            >
              <ThemedText style={styles.mapaBotaoTexto}>Cancelar</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.mapaBotao, { backgroundColor: '#007AFF' }]}
              onPress={confirmarLocalizacao}
            >
              <ThemedText style={styles.mapaBotaoTexto}>Confirmar Local</ThemedText>
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

  botoesLinhaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  cardPrevia: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  cardPreviaTitulo: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },

  previaImagem: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },

  coordenadasTexto: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },

  visitasContainer: {
    padding: 16,
  },

  visitasTitulo: {
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
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

  cameraVoltarButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    opacity: 0.6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraVoltarIcon: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },

  capturaButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  capturaButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },

  mapaInstrucaoContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  mapaInstrucaoTexto: {
    color: '#fff',
    fontSize: 13,
  },

  mapaBotoesContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },

  mapaBotao: {
    flex: 1,
    marginHorizontal: 6,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  mapaBotaoTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});