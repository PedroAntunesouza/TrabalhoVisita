import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useAuth } from '@/context/auth-context';
import AntDesign from '@expo/vector-icons/AntDesign';
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

  const validarLogin = () => {
    const emailFunc = 'funcionario@email.com';
    const senhaFunc = '123456';

    if (usuario === '' || senha === '') {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }

    if (usuario === emailFunc && senha === senhaFunc) {
      login(usuario, 'admin'); // Mantendo a role original se necessária no contexto
      Alert.alert('Sucesso', 'Login efetuado com sucesso');
      router.replace('/(tabs)/CadastroVisita');
      return;
    }

    Alert.alert('Erro', 'Usuário ou senha incorretos');
    setUsuario('');
    setSenha('');
  };

  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.logo}
        />
      }
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    >
      <Text style={styles.texto}>Login de usuário</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o usuário"
          value={usuario}
          onChangeText={setUsuario}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Digite a senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showSenha}
          />

          <Pressable
            onPress={() => setShowSenha((v) => !v)}
            style={styles.revealButton}
          >
            <AntDesign
              name={showSenha ? 'eye-invisible' : 'eye'}
              size={22}
              color="#007AFF"
            />
          </Pressable>
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Entrar" onPress={validarLogin} />
        </View>

        <Pressable onPress={() => router.replace('/cadastro')}>
          <Text style={styles.cadastroTexto}>
            Não tem conta? Cadastre-se aqui
          </Text>
        </Pressable>
      </View>

      <StatusBar style="auto" />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    marginTop: 70,
    height: 180,
    width: 290,
  },

  texto: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  formContainer: {
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 12,
  },

  input: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  passwordContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },

  passwordInput: {
    paddingRight: 45,
  },

  revealButton: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
  },

  buttonWrapper: {
    width: '100%',
    marginTop: 10,
  },

  cadastroTexto: {
    marginTop: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
});