import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import api from '@/service/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const validarLogin = async () => {
    if (usuario === '' || senha === '') {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }

    const emailFunc = 'funcionario@email.com';
    const senhaFunc = '123456';
    if (usuario === emailFunc && senha === senhaFunc) {
      login(usuario, 'admin');
      Alert.alert('Sucesso', 'Login efetuado com sucesso');
      router.replace('/(tabs)/CadastroVisita');
      return;
    }

    try {
      const response = await api.post("/user/login", { email: usuario, senha });
      const { email, role } = response.data; 

      login(email, role || 'user');
      Alert.alert('Sucesso', 'Login efetuado com sucesso');
      router.replace('/(tabs)/CadastroVisita');
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Erro', 'Usuário ou senha incorretos');
      } else {
        Alert.alert('Erro', error.message || 'Erro ao fazer login');
      }
      setUsuario('');
      setSenha('');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Bem-vindo</ThemedText>
        <ThemedText style={styles.subtitle}>Faça login para continuar</ThemedText>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Senha"
            placeholderTextColor="#8E8E93"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showSenha}
          />

          <Pressable
            onPress={() => setShowSenha((v) => !v)}
            style={styles.revealButton}
          >
            <IconSymbol
              name={showSenha ? 'eye.slash' : 'eye'}
              size={22}
              color="#0055FF"
            />
          </Pressable>
        </View>

        <Pressable style={styles.loginButton} onPress={validarLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/cadastro')} style={styles.linkButton}>
          <Text style={styles.cadastroTexto}>
            Ainda não tem uma conta? <Text style={{ color: '#0055FF', fontWeight: '800' }}>Cadastre-se</Text>
          </Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 24,
    justifyContent: 'center',
  },

  header: {
    marginBottom: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },

  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },

  formContainer: {
    width: '100%',
    gap: 16,
  },

  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  passwordContainer: {
    width: '100%',
    position: 'relative',
  },

  passwordInput: {
    paddingRight: 55,
  },

  revealButton: {
    position: 'absolute',
    right: 18,
    height: '100%',
    justifyContent: 'center',
  },

  loginButton: {
    backgroundColor: '#0055FF',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },

  cadastroTexto: {
    fontSize: 14,
    color: '#8E8E93',
  },
});