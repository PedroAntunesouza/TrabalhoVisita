import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0055FF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5EA',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Visitas',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="CadastroVisita"
        options={{
          title: 'Cadastrar',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="mappin.circle.fill" size={26} color={color} />
          ),
        }}
      />

      {/* camera e maps ficam acessíveis via código, mas não aparecem na barra */}
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Câmera',
          tabBarButton: () => null,
        }}
      />

      <Tabs.Screen
        name="maps"
        options={{
          title: 'Mapa',
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}