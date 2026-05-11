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

type Visita = {
  id: string;
  nomeLocal: string;
  nomeFuncionario: string;
  observacao: string;
  imagem: string | null;
};

const STORAGE_KEY = '@visitas';

export default function HomeScreen() {
  const router = useRouter();
  const { email, userType } = useAuth();

  const [visitas, setVisitas] = useState<Visita[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarVisitas() {
        try {
          const dados = await AsyncStorage.getItem(STORAGE_KEY);
          if (dados) {
            setVisitas(JSON.parse(dados));
          } else {
            setVisitas([]);
          }
        } catch {
          console.log('Erro ao carregar visitas');
          setVisitas([]);
        }
      }

      carregarVisitas();
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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded, fontSize: 20 }}>
          Visitas cadastradas
        </ThemedText>
      </ThemedView>

      <FlatList
        data={visitas}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ThemedView style={styles.visitaCard}>
            {item.imagem && (
              <Image
                source={{ uri: item.imagem }}
                style={styles.imagem}
                resizeMode="cover"
              />
            )}

            <ThemedText style={styles.textCard}>
              Local: {item.nomeLocal}
            </ThemedText>

            <ThemedText style={styles.textCard}>
              Funcionário responsável: {item.nomeFuncionario}
            </ThemedText>

            <ThemedText style={styles.textCard}>
              Observação: {item.observacao ? item.observacao : 'Nenhuma'}
            </ThemedText>
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

  visitaCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  imagem: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
  },

  textCard: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
});