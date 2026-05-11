import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, View } from 'react-native';

export default function Salvar() {

  const salvarUsuario = async () => {
    const usuario = {
      nome: "Jose",
      email: "jose@email.com"
    };

    try {
      const response = await fetch("http://192.168.1.138/app_teste/salvar.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
      });

      const data = await response.json();

      console.log("Resposta API:", data);

      if (data.status === "sucesso") {
        await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
        console.log("Salvo com sucesso!");
      }

    } catch (error) {
      console.log("Erro:", error);

      await AsyncStorage.setItem("usuario_offline", JSON.stringify(usuario));
    }
  };

  return (
    <View>
      <Button title="Salvar usuário" onPress={salvarUsuario} />
    </View>
  );
}