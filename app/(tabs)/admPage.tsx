import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '../../context/auth-context';

interface Produto {
  id: string;
  nome: string;
  preco: string;
  desc: string;
  imagem: string | null;
}

const STORAGE_KEY = '@produtos';

export default function AdminPage() {
  const { email } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [desc, setDesc] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        try {
          const dados = await AsyncStorage.getItem(STORAGE_KEY);
          if (dados) {
            setProdutos(JSON.parse(dados));
          } else {
            setProdutos([]);
          }
        } catch {
          Alert.alert('Erro', 'Falha ao carregar produtos');
        }
      }
      carregar();
    }, [])
  );

  async function escolherImagem() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
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

  async function adicionarProduto() {
    if (!nome || !preco || !desc) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const novoProduto: Produto = {
      id: Date.now().toString(),
      nome,
      preco,
      desc,
      imagem,
    };

    try {
      const dados = await AsyncStorage.getItem(STORAGE_KEY);
      const listaAtual: Produto[] = dados ? JSON.parse(dados) : [];

      const novaLista = [...listaAtual, novoProduto];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));

      setProdutos(novaLista);

      try {
        const response = await fetch(
          "http://192.168.1.138:8080/app_teste/salvar_produto.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(novoProduto)
          }
        );
        if (!response.ok) {
          console.log("Erro na API ao salvar produto:", response.status);
        }
      } catch (apiError) {
        console.log("Erro de rede ao salvar produto na API:", apiError);
      }

      setNome('');
      setPreco('');
      setDesc('');
      setImagem(null);

      Alert.alert('Sucesso', 'Produto criado!');
    } catch {
      Alert.alert('Erro', 'Falha ao salvar produto');
    }
  }

  async function removerProduto(id: string) {
    const novaLista = produtos.filter((item) => item.id !== id);

    setProdutos(novaLista);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
  }

  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} />
        <View style={styles.cameraButtonsContainer}>
          <Button title="TIRAR FOTO" onPress={capturarFoto} />
        </View>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
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
          Olá {email}
        </ThemedText>
      </ThemedView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>
            Adicionar Produto
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />

          <TextInput
            style={styles.input}
            placeholder="Preço"
            value={preco}
            keyboardType="numeric"
            onChangeText={setPreco}
          />

          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={desc}
            onChangeText={setDesc}
          />

          <View style={styles.rowButtons}>
            <Pressable style={[styles.imageButton, { flex: 1, marginRight: 5 }]} onPress={escolherImagem}>
              <ThemedText style={styles.imageButtonText}>
                Escolher Imagem
              </ThemedText>
            </Pressable>

            <Pressable style={[styles.imageButton, { flex: 1, marginLeft: 5 }]} onPress={abrirCamera}>
              <ThemedText style={styles.imageButtonText}>
                Tirar Foto
              </ThemedText>
            </Pressable>
          </View>

          {imagem && (
            <Image source={{ uri: imagem }} style={styles.previewImage} />
          )}

          <Button title="Adicionar Produto" onPress={adicionarProduto} />
        </ThemedView>
      </KeyboardAvoidingView>

      {produtos.length > 0 && (
        <ThemedView style={styles.produtosContainer}>
          <ThemedText style={styles.produtosTitle}>
            Produtos Criados
          </ThemedText>

          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.produtoCard}>
                {item.imagem && (
                  <Image
                    source={{ uri: item.imagem }}
                    style={styles.cardImage}
                  />
                )}

                <ThemedText style={styles.produtoNome}>
                  {item.nome}
                </ThemedText>

                <ThemedText>R$ {item.preco}</ThemedText>
                <ThemedText>Descrição: {item.desc}</ThemedText>

                <Pressable onPress={() => removerProduto(item.id)}>
                  <ThemedText style={{ color: 'red', marginTop: 6 }}>
                    Excluir
                  </ThemedText>
                </Pressable>
              </ThemedView>
            )}
          />
        </ThemedView>
      )}

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
  produtosContainer: {
    padding: 16,
  },
  produtosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: Fonts.rounded,
  },
  produtoCard: {
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
  produtoNome: {
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
});