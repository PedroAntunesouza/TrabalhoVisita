import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importação do componente de armazenamento
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [produto, setProduto] = useState('');
  const [preco, setPreco] = useState('');
  const [desc, setDesc] = useState('');
  type Produto = {
    id: string;
    nome: string;
    preco: string;
    desc: string;
  };
  const [lista, setLista] = useState<Produto[]>([]);
  // Chave única 
  const STORAGE_KEY = '@meu_app_estoque';

  // ---  INICIAL: Carrega o que estiver salvo quando o app abre ---
  useEffect(() => {
    async function carregarDados() {
      try {
        const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
        if (dadosSalvos !== null) {
          setLista(JSON.parse(dadosSalvos));
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados.");
      }
    }
    carregarDados();
  }, []);

  // --- FUNÇÃO: Salvar novo produto ---
  const adicionarProduto = async () => {
    if (produto.trim() === '') return;

    try {
      const novoItem = {
        id: Date.now().toString(),
        nome: produto,
        preco: preco,
        desc: desc
      };
      const novaLista = [...lista, novoItem];

      // 1. Atualiza o Estado (Interface)
      setLista(novaLista);

      // 2. Salva no AsyncStorage (Persistência)
      // Importante: Transformar em String antes de salvar
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));

      setProduto('');
      setPreco('');
      setDesc('');
      // Limpa o input
    } catch (error) {
      Alert.alert("Erro", "Falha ao gravar no dispositivo.");
    }
  };

  // --- FUNÇÃO: Remover produto ---
  const removerProduto = async (id: string) => {
    const listaFiltrada = lista.filter(item => item.id !== id);
    setLista(listaFiltrada);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listaFiltrada));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>📦 Cadastro de Estoque</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome do produto..."
          value={produto}
          onChangeText={setProduto}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço do produto..."
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Descrição do produto..."
          value={desc}
          onChangeText={setDesc}
        />
        <TouchableOpacity style={styles.botao} onPress={adicionarProduto}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lista}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTexto}>{item.nome}</Text>
            <Text style={styles.cardTexto}>R$ {item.preco}</Text>
            <Text style={styles.cardTexto}>Descrição: {item.desc}</Text>
            <TouchableOpacity onPress={() => removerProduto(item.id)}>
              <Text style={{ color: 'red' }}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 50 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  form: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  botao: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginLeft: 10, justifyContent: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff', padding: 15, borderRadius: 8,
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
    elevation: 2 // Sombra no Android
  },
  cardTexto: { fontSize: 16 }
});
