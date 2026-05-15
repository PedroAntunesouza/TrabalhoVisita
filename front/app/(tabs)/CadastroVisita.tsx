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
  date?: string;
}

interface Coordenadas {
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = '@visitas';

const formatarData = (dataStr?: string) => {
  if (!dataStr) return 'Data não disponível';
  try {
    const data = new Date(dataStr);
    return data.toLocaleString('pt-BR');
  } catch (e) {
    return 'Data inválida';
  }
};

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

  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
  const [visitaSendoEditada, setVisitaSendoEditada] = useState<Visita | null>(null);
  const [nomeLocalEdit, setNomeLocalEdit] = useState('');
  const [observacaoEdit, setObservacaoEdit] = useState('');
  const [imagemEdit, setImagemEdit] = useState<string | null>(null);
  const [coordenadasEdit, setCoordenadasEdit] = useState<Coordenadas | null>(null);
  const [targetState, setTargetState] = useState<'create' | 'edit'>('create');

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
    
    if (targetState === 'create') {
      setMarcadorTemp(coordenadas);
    } else {
      setMarcadorTemp(coordenadasEdit);
    }
    
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
    if (targetState === 'create') {
      setCoordenadas(marcadorTemp);
    } else {
      setCoordenadasEdit(marcadorTemp);
    }
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
      if (targetState === 'create') {
        setImagem(result.uri);
      } else {
        setImagemEdit(result.uri);
      }
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
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta visita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/visit/delete/${id}`);
              const novaLista = visitas.filter((item) => item.id !== id);
              setVisitas(novaLista);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
            } catch (error) {
              console.log('Erro ao excluir:', error);
              Alert.alert('Erro', 'Falha ao excluir visita do servidor');
            }
          },
        },
      ]
    );
  }

  function abrirEdicao(visita: Visita) {
    setVisitaSendoEditada(visita);
    setNomeLocalEdit(visita.localName);
    setObservacaoEdit(visita.observation);
    setImagemEdit(visita.uriImagem);
    setCoordenadasEdit({ latitude: visita.latitude, longitude: visita.longitude });
    setTargetState('edit');
    setModalEdicaoVisivel(true);
  }

  async function salvarEdicao() {
    if (!visitaSendoEditada?.id) return;

    if (!nomeLocalEdit.trim()) {
      Alert.alert('Erro', 'Preencha o nome do local');
      return;
    }

    const data = {
      localName: nomeLocalEdit,
      observation: observacaoEdit,
      uriImagem: imagemEdit,
      latitude: coordenadasEdit?.latitude,
      longitude: coordenadasEdit?.longitude,
    };

    try {
      const response = await api.put(`/visit/update/${visitaSendoEditada.id}`, data);
      
      const novasVisitas = visitas.map(v => v.id === visitaSendoEditada.id ? response.data : v);
      setVisitas(novasVisitas);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novasVisitas));
      
      setModalEdicaoVisivel(false);
      Alert.alert('Sucesso', 'Visita atualizada!');
    } catch (error) {
      console.log('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Falha ao atualizar visita');
    }
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
        light: '#F2F2F7',
        dark: '#F2F2F7',
      }}
      headerImage={
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Nova Visita</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>

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
            placeholderTextColor="#8E8E93"
            value={nomeLocal}
            onChangeText={setNomeLocal}
          />

          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Observação"
            placeholderTextColor="#8E8E93"
            multiline
            value={observacao}
            onChangeText={setObservacao}
          />

          <View style={styles.rowButtons}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: '#F2F2F7' }]}
              onPress={() => {
                setTargetState('create');
                abrirCamera();
              }}
            >
              <IconSymbol name="camera.fill" size={20} color="#0055FF" />
              <ThemedText style={[styles.actionButtonText, { color: '#0055FF' }]}>
                Foto
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: '#F2F2F7' }]}
              onPress={() => {
                setTargetState('create');
                abrirMapa();
              }}
            >
              <IconSymbol name="mappin.and.ellipse" size={20} color="#0055FF" />
              <ThemedText style={[styles.actionButtonText, { color: '#0055FF' }]}>
                Local
              </ThemedText>
            </Pressable>
          </View>

          {(imagem || coordenadas) && (
            <View style={styles.previaContainer}>
              {imagem && (
                <View style={styles.miniCard}>
                  <Image source={{ uri: imagem }} style={styles.miniImage} />
                  <ThemedText style={styles.miniText}>Foto OK</ThemedText>
                </View>
              )}
                {coordenadas && (
                  <View style={styles.miniCard}>
                    <IconSymbol name="mappin.circle.fill" size={24} color="#34C759" />
                    <View>
                      <ThemedText style={[styles.miniText, { fontWeight: '700' }]}>Localização</ThemedText>
                      <ThemedText style={{ fontSize: 10, color: '#8E8E93' }}>
                        Lat: {coordenadas.latitude.toFixed(4)} Lng: {coordenadas.longitude.toFixed(4)}
                      </ThemedText>
                    </View>
                  </View>
                )}
            </View>
          )}

          <Pressable style={styles.submitButton} onPress={adicionarVisita}>
            <ThemedText style={styles.submitButtonText}>Salvar Visita</ThemedText>
          </Pressable>
        </ThemedView>
      </KeyboardAvoidingView>

      {visitas.length > 0 && (
        <ThemedView style={styles.visitasContainer}>
          <ThemedText style={styles.visitasTitle}>
            Visitas Cadastradas
          </ThemedText>

          {visitas.map((item, index) => (
            <View
              key={item.id?.toString() || index.toString()}
              style={styles.modernCard}
            >
              {item.uriImagem && (
                <Image
                  source={{ uri: item.uriImagem }}
                  style={styles.cardImageModern}
                />
              )}

              <View style={styles.cardContentModern}>
                <ThemedText style={styles.cardTitleModern}>
                  {item.localName}
                </ThemedText>
                
                <ThemedText style={styles.cardSubTitleModern} numberOfLines={1}>
                  {item.observation || 'Sem observações'}
                </ThemedText>

                <ThemedText style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
                  Local: {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}
                </ThemedText>
                
                {item.date && (
                  <ThemedText style={{ fontSize: 10, color: '#8E8E93', marginTop: 2 }}>
                    Data: {formatarData(item.date)}
                  </ThemedText>
                )}

                <View style={styles.cardActionsModern}>
                  <Pressable
                    style={styles.miniActionButton}
                    onPress={() => abrirEdicao(item)}
                  >
                    <ThemedText style={{ color: '#0055FF', fontSize: 13, fontWeight: 'bold' }}>
                      Editar
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={styles.miniActionButton}
                    onPress={() => item.id && removerVisita(item.id)}
                  >
                    <ThemedText style={{ color: '#FF3B30', fontSize: 13, fontWeight: 'bold' }}>
                      Excluir
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
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

      {/* Modal de Edição */}
      <Modal
        visible={modalEdicaoVisivel}
        animationType="slide"
        transparent={false}
      >
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#F2F2F7', dark: '#F2F2F7' }}
          headerImage={
            <View style={styles.headerContent}>
              <ThemedText style={styles.headerTitle}>Editar Visita</ThemedText>
            </View>
          }
        >
          <ThemedView style={styles.formContainer}>

            <TextInput
              style={styles.input}
              placeholder="Nome do local"
              placeholderTextColor="#8E8E93"
              value={nomeLocalEdit}
              onChangeText={setNomeLocalEdit}
            />

            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Observação"
              placeholderTextColor="#8E8E93"
              multiline
              value={observacaoEdit}
              onChangeText={setObservacaoEdit}
            />

            <View style={styles.rowButtons}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: '#F2F2F7' }]}
                onPress={() => {
                  setTargetState('edit');
                  abrirCamera();
                }}
              >
                <IconSymbol name="camera.fill" size={20} color="#0055FF" />
                <ThemedText style={[styles.actionButtonText, { color: '#0055FF' }]}>Foto</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.actionButton, { backgroundColor: '#F2F2F7' }]}
                onPress={() => {
                  setTargetState('edit');
                  abrirMapa();
                }}
              >
                <IconSymbol name="mappin.and.ellipse" size={20} color="#0055FF" />
                <ThemedText style={[styles.actionButtonText, { color: '#0055FF' }]}>Local</ThemedText>
              </Pressable>
            </View>

            {(imagemEdit || coordenadasEdit) && (
              <View style={styles.previaContainer}>
                {imagemEdit && (
                  <View style={styles.miniCard}>
                    <Image source={{ uri: imagemEdit }} style={styles.miniImage} />
                    <ThemedText style={styles.miniText}>Foto OK</ThemedText>
                  </View>
                )}
                {coordenadasEdit && (
                  <View style={styles.miniCard}>
                    <IconSymbol name="mappin.circle.fill" size={24} color="#34C759" />
                    <View>
                      <ThemedText style={[styles.miniText, { fontWeight: '700' }]}>Localização</ThemedText>
                      <ThemedText style={{ fontSize: 10, color: '#8E8E93' }}>
                        Lat: {coordenadasEdit.latitude.toFixed(4)} Lng: {coordenadasEdit.longitude.toFixed(4)}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Pressable
                style={[styles.miniActionButton, { flex: 1, alignItems: 'center' }]}
                onPress={() => setModalEdicaoVisivel(false)}
              >
                <ThemedText style={{ color: '#FF3B30', fontWeight: '700' }}>Cancelar</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.submitButton, { flex: 2 }]}
                onPress={salvarEdicao}
              >
                <ThemedText style={styles.submitButtonText}>Salvar Alterações</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
          <ThemedView style={{ height: 100 }} />
        </ParallaxScrollView>
      </Modal>

      <ThemedView style={{ height: 80 }} />
        </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
  },

  headerContent: {
    height: 140,
    justifyContent: 'center',
    paddingTop: 30,
    backgroundColor: '#0055FF',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },

  formContainer: {
    backgroundColor: '#121212',
    gap: 16,
  },

  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    fontFamily: Fonts.rounded,
  },

  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  rowButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },

  actionButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },

  previaContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },

  miniCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333333',
    width: '100%',
    marginBottom: 10,
  },

  miniImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },

  miniText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  submitButton: {
    backgroundColor: '#0055FF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  visitasContainer: {
    marginTop: 30,
  },

  visitasTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: Fonts.rounded,
  },

  modernCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },

  cardImageModern: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },

  cardContentModern: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },

  cardTitleModern: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cardSubTitleModern: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },

  cardActionsModern: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  miniActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonsContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  cameraCaptureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordsFloatingBox: {
    position: 'absolute',
    top: 50,
    left: '25%',
    right: '25%',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    zIndex: 10,
  },
  mapActionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  mapActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  mapActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});