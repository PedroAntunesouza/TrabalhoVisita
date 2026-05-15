import { Fonts } from "@/constants/theme";
import api from "@/service/api";
import { useAuth } from "@/context/auth-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CadastroUsuarioScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const realizarCadastro = async () => {
    if (!name.trim() || !email.trim() || !senha.trim()) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      await api.post("/user/create", { name, email, senha });

      login(email, "user", name);

      Alert.alert("Sucesso", "Conta criada!", [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Erro ao realizar cadastro";

      if (error.response?.status === 409) {
        Alert.alert("Erro", "E-mail já cadastrado!");
      } else {
        Alert.alert("Erro", typeof errorMessage === 'string' ? errorMessage : "Está conta já está cadastrada!");
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#8E8E93"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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

        <Pressable style={styles.registerButton} onPress={realizarCadastro}>
          <Text style={styles.registerButtonText}>Cadastrar</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/login')} style={styles.linkButton}>
          <Text style={styles.linkText}>
            Já tem uma conta? <Text style={{ color: '#0055FF', fontWeight: '800' }}>Faça login</Text>
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

  registerButton: {
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

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },

  linkText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});