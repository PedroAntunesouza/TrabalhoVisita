import ParallaxScrollView from "@/components/parallax-scroll-view";
import api from "@/service/api";
import { useAuth } from "@/context/auth-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
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
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showSenha}
          />

          <Pressable
            onPress={() => setShowSenha((v) => !v)}
            style={styles.revealButton}
          >
            <AntDesign
              name={showSenha ? "eye-invisible" : "eye"}
              size={22}
              color="#007AFF"
            />
          </Pressable>
        </View>

        <Pressable style={styles.botao} onPress={realizarCadastro}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Já tem um cadastro? Faça o Login!</Text>
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
  passwordContainer: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 45,
  },
  revealButton: {
    position: "absolute",
    right: 10,
    height: "100%",
    justifyContent: "center",
  },
});