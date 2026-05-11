import { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';

export default function Listar() {
  const [usuarios, setUsuarios] = useState<
  { id: string; nome: string; email: string }[]
  >([]);

  const buscarUsuarios = async () => {
    try {
      const response = await fetch("http://10.67.52.50/app_teste/listar.php");
      const data = await response.json();

      console.log("Dados:", data);
      setUsuarios(data);

    } catch (error) {
      console.log("Erro ao buscar:", error);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Button title="Atualizar" onPress={buscarUsuarios} />

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginTop: 15, padding: 10, borderWidth: 1 }}>
            <Text>Nome: {item.nome}</Text>
            <Text>Email: {item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}