import ParallaxScrollView from "@/components/parallax-scroll-view";
import api from "@/service/api";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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

  const router = useRouter();

  const realizarCadastro = async () => {
    if (!name.trim() || !email.trim() || !senha.trim()) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      await api.post("/user/create", { name, email, senha });

      Alert.alert("Sucesso", "Conta criada!", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert("Erro", "E-mail já cadastrado");
      } else {
        Alert.alert("Erro", error.message)
      }
    }
  };

  return ( 
    <ParallaxScrollView
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.logo}
        />
      }
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <Text style={styles.texto}>Cadastro de usuário</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite o email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <Pressable style={styles.botao} onPress={realizarCadastro}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Já tem conta? Login</Text>
        </Pressable>
      </View>

      <StatusBar style="auto" />
    </ParallaxScrollView>
  );
} // ✅ fecha o componente

const styles = StyleSheet.create({
  logo: {
    marginTop: 70,
    height: 180,
    width: 290,
  },
  texto: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  formContainer: {
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
    gap: 12,
  },
  input: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  botao: {
    width: "100%",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    marginTop: 10,
    color: "#007AFF",
    fontWeight: "600",
  },
});