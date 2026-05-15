import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import api from '@/service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

type Visita = {
  id: number;
  localName: string;
  observation: string;
  latitude: number;
  longitude: number;
  uriImagem: string;
  date: string;
  userEmail?: string;
};

const STORAGE_KEY = '@visitas';

function formatarData(dataISO: string) {
  if (!dataISO) return '';
  const data = new Date(dataISO);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { email, userType } = useAuth();

  const [visitas, setVisitas] = useState<Visita[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarVisitas() {
        if (!email) {
          setVisitas([]);
          return;
        }

        try {
          const response = await api.get('/visit/returnAll');

          const visitasCarregadas = response.data || [];
          setVisitas(visitasCarregadas);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(visitasCarregadas));
        } catch (error: any) {
          console.log('Erro ao carregar visitas:', error.response?.data || error.message || error);

          try {
            const dados = await AsyncStorage.getItem(STORAGE_KEY);
            if (dados) {
              setVisitas(JSON.parse(dados));
            } else {
              setVisitas([]);
            }
          } catch {
            setVisitas([]);
          }
        }
      }

      carregarVisitas();
    }, [email])
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

      {visitas.map((item) => (
        <ThemedView
          key={item.id?.toString() || Math.random().toString()}
          style={styles.visitaCard}
        >
          {item.uriImagem && (
            <Image
              source={{ uri: item.uriImagem }}
              style={styles.imagem}
              resizeMode="cover"
            />
          )}

          <ThemedText style={styles.textCard}>
            Local: {item.localName}
          </ThemedText>

          {item.userEmail && (
            <ThemedText style={styles.textCard}>
              Registrado por: {item.userEmail}
            </ThemedText>
          )}

          <ThemedText style={styles.textCard}>
            Observação: {item.observation ? item.observation : 'Nenhuma'}
          </ThemedText>

          {item.latitude != null && item.longitude != null && (
            <ThemedText style={styles.textCard}>
              Coordenadas: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
            </ThemedText>
          )}

          {item.date && (
            <ThemedText style={styles.textCard}>
              Registrado em: {formatarData(item.date)}
            </ThemedText>
          )}
        </ThemedView>
      ))}

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