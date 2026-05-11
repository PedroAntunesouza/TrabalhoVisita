import ParallaxScrollView from "@/components/parallax-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();
  const STORAGE_KEY = "@meu_app_usuarios";

  const realizarCadastro = async () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
      const usuarios = dadosSalvos ? JSON.parse(dadosSalvos) : [];

      const existe = usuarios.find((u: any) => u.email === email);
      if (existe) {
        Alert.alert("Erro", "Usuário já existe");
        return;
      }

      const novoUsuario = { nome, email };
      usuarios.push(novoUsuario);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));

      try {
        const response = await fetch(
          "http://192.168.1.138:8080/app_teste/salvar.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(novoUsuario)
          }
        );

        const responseText = await response.text();
        let data = null;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.log("Resposta API não é JSON:", responseText);
        }

        if (response.ok && data?.status === "sucesso") {
          console.log("Resposta API:", data);
        } else {
          console.log("API retornou erro:", response.status, data ?? responseText,);
          await AsyncStorage.setItem("@meu_app_usuario_offline", JSON.stringify(novoUsuario));
        }
      } catch (error) {
        console.log("Erro ao enviar para API:", error);
        await AsyncStorage.setItem("@meu_app_usuario_offline", JSON.stringify(novoUsuario));
      }

      Alert.alert("Sucesso", "Conta criada", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch {
      Alert.alert("Erro", "Falha ao cadastrar");
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
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite o email"
          value={email}
          onChangeText={setEmail}
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
});