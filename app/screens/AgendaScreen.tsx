// LexProMobile/app/screens/AgendaScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface para tipagem dos dados do Evento
interface Evento {
  id: string;
  data: string; // YYYY-MM-DD
  titulo: string;
  tipo: 'Prazo Processual' | 'Audiência' | 'Reunião' | 'Outro';
  descricao: string;
}

// Chave para AsyncStorage
const STORAGE_KEY_EVENTOS = '@LexProMobile:eventos';

const AgendaScreen: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [novoEvento, setNovoEvento] = useState<Omit<Evento, 'id'>>({
    data: new Date().toISOString().split('T')[0],
    titulo: '',
    tipo: 'Prazo Processual',
    descricao: ''
  });

  // Carregar eventos do AsyncStorage ao montar o componente
  useEffect(() => {
    const loadEventos = async () => {
      try {
        const storedEventos = await AsyncStorage.getItem(STORAGE_KEY_EVENTOS);
        if (storedEventos !== null) {
          setEventos(JSON.parse(storedEventos));
        }
      } catch (error) {
        console.error('Erro ao carregar eventos do AsyncStorage:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados dos eventos.');
      }
    };
    loadEventos();
  }, []);

  // Salvar eventos no AsyncStorage sempre que a lista de eventos mudar
  useEffect(() => {
    const saveEventos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_EVENTOS, JSON.stringify(eventos));
      } catch (error) {
        console.error('Erro ao salvar eventos no AsyncStorage:', error);
      }
    };
    saveEventos();
  }, [eventos]);

  const handleEventoInputChange = useCallback((fieldName: keyof Omit<Evento, 'id'>, value: string) => {
    setNovoEvento(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmitEventoForm = useCallback(() => {
    if (!novoEvento.data || !novoEvento.titulo.trim()) {
      Alert.alert('Campos Obrigatórios', 'Data e Título são obrigatórios.');
      return;
    }

    const eventoComId: Evento = {
      ...novoEvento,
      id: new Date().toISOString() // Gera um ID único simples
    };

    setEventos(prevEventos => [eventoComId, ...prevEventos]); // Adiciona no início da lista
    setNovoEvento({ 
      data: new Date().toISOString().split('T')[0],
      titulo: '',
      tipo: 'Prazo Processual',
      descricao: ''
    }); // Limpa o formulário
    Alert.alert('Sucesso', 'Evento adicionado com sucesso!');
  }, [novoEvento]);

  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderEventoItem = ({ item }: { item: Evento }) => (
    <View style={[styles.listItem, styles[`eventoTipo${item.tipo.replace(/\s+/g, '')}`]]}>
      <Text style={styles.listItemTextStrong}>{item.titulo}</Text>
      <Text style={styles.listItemText}>{formatarData(item.data)}</Text>
      <Text style={styles.listItemText}>Tipo: {item.tipo}</Text>
      {item.descricao ? <Text style={styles.listItemText}>Descrição: {item.descricao}</Text> : null}
    </View>
  );

  // Ordenar eventos por data
  const eventosOrdenados = [...eventos].sort((a, b) => {
    return new Date(a.data).getTime() - new Date(b.data).getTime();
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.container}>
            <Text style={styles.header}>Agenda e Prazos</Text>

            <View style={styles.formSection}>
              <Text style={styles.subHeader}>Adicionar Novo Evento</Text>
              <TextInput
                style={styles.input}
                placeholder="Data do Evento *"
                value={novoEvento.data}
                onChangeText={(text) => handleEventoInputChange('data', text)}
                placeholderTextColor="#888"
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Título do Evento *"
                value={novoEvento.titulo}
                onChangeText={(text) => handleEventoInputChange('titulo', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.selectInput]}
                placeholder="Tipo de Evento"
                value={novoEvento.tipo}
                editable={false}
                placeholderTextColor="#888"
              />
              <View style={styles.tipoButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.tipoButton, novoEvento.tipo === 'Prazo Processual' && styles.tipoButtonSelected]}
                  onPress={() => handleEventoInputChange('tipo', 'Prazo Processual')}
                >
                  <Text style={[styles.tipoButtonText, novoEvento.tipo === 'Prazo Processual' && styles.tipoButtonTextSelected]}>
                    Prazo Processual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tipoButton, novoEvento.tipo === 'Audiência' && styles.tipoButtonSelected]}
                  onPress={() => handleEventoInputChange('tipo', 'Audiência')}
                >
                  <Text style={[styles.tipoButtonText, novoEvento.tipo === 'Audiência' && styles.tipoButtonTextSelected]}>
                    Audiência
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tipoButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.tipoButton, novoEvento.tipo === 'Reunião' && styles.tipoButtonSelected]}
                  onPress={() => handleEventoInputChange('tipo', 'Reunião')}
                >
                  <Text style={[styles.tipoButtonText, novoEvento.tipo === 'Reunião' && styles.tipoButtonTextSelected]}>
                    Reunião
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tipoButton, novoEvento.tipo === 'Outro' && styles.tipoButtonSelected]}
                  onPress={() => handleEventoInputChange('tipo', 'Outro')}
                >
                  <Text style={[styles.tipoButtonText, novoEvento.tipo === 'Outro' && styles.tipoButtonTextSelected]}>
                    Outro
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição (Opcional)"
                value={novoEvento.descricao}
                onChangeText={(text) => handleEventoInputChange('descricao', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitEventoForm}>
                <Text style={styles.buttonText}>Adicionar Evento</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.subHeader}>Eventos Agendados</Text>
              {eventosOrdenados.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhum evento agendado.</Text>
              ) : (
                <FlatList
                  data={eventosOrdenados}
                  renderItem={renderEventoItem}
                  keyExtractor={item => item.id}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#004c99',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  selectInput: {
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tipoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tipoButtonSelected: {
    backgroundColor: '#0059b3',
    borderColor: '#0059b3',
  },
  tipoButtonText: {
    color: '#333',
    fontSize: 14,
  },
  tipoButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0059b3',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listSection: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  listItem: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  eventoTipoPrazoProcessual: {
    borderLeftColor: '#dc3545',
  },
  eventoTipoAudiência: {
    borderLeftColor: '#ffc107',
  },
  eventoTipoReunião: {
    borderLeftColor: '#17a2b8',
  },
  eventoTipoOutro: {
    borderLeftColor: '#6c757d',
  },
  listItemTextStrong: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 3,
  },
  listItemText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 2,
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  }
});

export default AgendaScreen;