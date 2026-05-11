import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const { userType } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: userType === 'user' ? { display: 'none' } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={26} color={color} />
          ),
        }}
      />

      {userType === 'admin' && (
        <Tabs.Screen
          name="admPage"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color }) => (
              <IconSymbol name="gearshape.fill" size={26} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}