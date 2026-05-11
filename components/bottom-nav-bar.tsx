import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

interface BottomNavBarProps {
  email?: string;
  userType: 'admin' | 'user'; 
}

export default function BottomNavBar({ email = '', userType }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  
  const goToHome = () => {
      router.replace('/(tabs)');
    };
    
    const goToAdminPage = () => {
        router.replace('/(tabs)/admPage');
    };
    
    const goToLogin = () => {
      router.replace('/login');
    };

  const isAdmin = userType === 'admin';

  return (
    <View style={[styles.navBar, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
      
      <Pressable
        style={[
          styles.navButton,
          (pathname === '/(tabs)' || pathname === '/(tabs)/index') && styles.activeButton,
          { borderTopColor: (pathname === '/(tabs)' || pathname === '/(tabs)/index') ? tintColor : 'transparent' },
        ]}
        onPress={goToHome}>
        <ThemedText style={[styles.navText, (pathname === '/(tabs)' || pathname === '/(tabs)/index') && { color: tintColor }]}>Home</ThemedText>
      </Pressable>

      <Pressable
        style={[
          styles.navButton,
          pathname === '/(tabs)/admPage' && styles.activeButton,
          { borderTopColor: pathname === '/(tabs)/admPage' ? tintColor : 'transparent' },
        ]}
        onPress={goToAdminPage}>
        <ThemedText style={[styles.navText, pathname === '/(tabs)/admPage' && { color: tintColor }]}>Admin</ThemedText>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
  },
  activeButton: {
    // marcado pelo borderTopColor
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
