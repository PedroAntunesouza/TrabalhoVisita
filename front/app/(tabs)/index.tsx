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
      headerBackgroundColor={{ light: '#0055FF', dark: '#0055FF' }}
      headerImage={
        <View style={styles.headerContent}>
          <Pressable
            style={styles.logoutButton}
            onPress={() => router.replace('/login')}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FFFFFF" />
            <ThemedText style={styles.logoutText}>Sair</ThemedText>
          </Pressable>
          <ThemedText style={styles.headerTitle}>Visitas</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        {visitas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="doc.text.magnifyingglass" size={64} color="#C7C7CC" />
            <ThemedText style={styles.emptyText}>Nenhuma visita encontrada</ThemedText>
          </View>
        ) : (
          visitas.map((item) => (
            <ThemedView
              key={item.id?.toString() || Math.random().toString()}
              style={styles.modernCard}
            >
              {item.uriImagem && (
                <Image
                  source={{ uri: item.uriImagem }}
                  style={styles.cardImageModern}
                  resizeMode="cover"
                />
              )}

              <View style={styles.cardContentModern}>
                <ThemedText style={styles.cardTitleModern}>
                  {item.localName}
                </ThemedText>
                
                <ThemedText style={{ fontSize: 12, color: '#0055FF', fontWeight: '600', marginTop: 4 }}>
                  Data: {formatarData(item.date)}
                </ThemedText>

                <ThemedText style={styles.cardObsModern} numberOfLines={2}>
                  {item.observation || 'Sem observações'}
                </ThemedText>

                <ThemedText style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
                  Local: {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}
                </ThemedText>

                {item.userEmail && (
                  <View style={styles.tagContainer}>
                    <ThemedText style={styles.tagText}>
                      Por: {item.userEmail}
                    </ThemedText>
                  </View>
                )}
              </View>
            </ThemedView>
          ))
        )}
      </ThemedView>
      <ThemedView style={{ height: 100 }} />
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

  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  modernCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  cardImageModern: {
    width: '100%',
    height: 200,
  },

  cardContentModern: {
    padding: 16,
  },

  cardTitleModern: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },

  cardDateModern: {
    fontSize: 12,
    color: '#0055FF',
    fontWeight: '600',
    marginTop: 4,
  },

  cardObsModern: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    lineHeight: 20,
  },

  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#2C2C2E',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 12,
  },

  tagText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },

  emptyText: {
    marginTop: 16,
    color: '#C7C7CC',
    fontSize: 16,
    fontWeight: '500',
  },
});