import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

type Produto = {
  id: string;
  nome: string;
  preco: string;
  desc: string;
  imagem: any;
};

const PRODUTOS_PADRAO: Produto[] = [
  { id: 'p1', nome: 'Camisa Básica', preco: '59.90', desc: 'Camisa 100% algodão', imagem: require('@/assets/images/camisa.png') },
  { id: 'p2', nome: 'Calça Jeans', preco: '129.90', desc: 'Calça premium', imagem: require('@/assets/images/calca.png') },
  { id: 'p3', nome: 'Tênis Esportivo', preco: '199.90', desc: 'Para caminhada e corrida', imagem: require('@/assets/images/tenis.png') },
  { id: 'p4', nome: 'Boné Classic', preco: '49.90', desc: 'Aba curva ajustável', imagem: require('@/assets/images/bone.png') },
  { id: 'p5', nome: 'Moletom Confort', preco: '149.90', desc: 'Moletom de inverno', imagem: require('@/assets/images/moletom.png') },
];

const STORAGE_KEY = '@produtos';

export default function HomeScreen() {
  const router = useRouter();
  const { email, userType } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_PADRAO);

  useFocusEffect(
    useCallback(() => {
      async function carregarProdutos() {
        try {
          const dados = await AsyncStorage.getItem(STORAGE_KEY);
          if (dados) {
            const adminProds = JSON.parse(dados);
            setProdutos([...PRODUTOS_PADRAO, ...adminProds]);
          } else {
            setProdutos(PRODUTOS_PADRAO);
          }
        } catch {
          console.log('Erro ao carregar produtos');
          setProdutos(PRODUTOS_PADRAO);
        }
      }

      carregarProdutos();
    }, [])
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerContainer}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/login')}
          >
            <ThemedText style={styles.backButtonText}>Sair</ThemedText>
          </Pressable>

          <IconSymbol
            size={310}
            color="#808080"
            name="house.fill"
            style={styles.headerImage}
          />
        </View>
      }
    >
      {userType === 'user' && (
        <ThemedView style={styles.greetingContainer}>
          <ThemedText style={styles.greetingText}>
            Olá {email}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Produtos da Loja
        </ThemedText>
      </ThemedView>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ThemedView style={styles.card}>
            <Image
              source={
                typeof item.imagem === 'string'
                  ? { uri: item.imagem }
                  : item.imagem || require('@/assets/images/camisa.png')
              }
              style={styles.imagem}
              resizeMode="cover"
            />

            <ThemedText style={styles.nome}>
              {item.nome}
            </ThemedText>

            <View style={styles.infoRow}>
              <ThemedText style={styles.preco}>
                R$ {item.preco}
              </ThemedText>

              <ThemedText style={styles.estoque}>
                {item.desc}
              </ThemedText>
            </View>
          </ThemedView>
        )}
      />

      <View style={{ height: 100 }} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 260,
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  headerImage: {
    position: 'absolute',
    bottom: -90,
    left: -35,
  },

  greetingContainer: {
    marginBottom: 12,
  },

  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },

  titleContainer: {
    marginBottom: 20,
  },

  card: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#1e1e1e',
  },

  imagem: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: Fonts.rounded,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  preco: {
    color: '#27ae60',
    fontWeight: '600',
  },

  estoque: {
    opacity: 0.7,
  },
});