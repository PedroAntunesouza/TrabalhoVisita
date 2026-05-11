import { Button, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function TabTwoScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Login ou senha incorretos!
        </ThemedText>
        </ThemedView>

      <View style={styles.buttonWrapper}>
        <Button title="Tente Novamente" color="#007AFF" onPress={() => router.replace('/login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonWrapper: {
    marginTop: 24,
    width: '60%'
  }
});