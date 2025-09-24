import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Tipagem para os dados do dashboard
interface ProcessoResumo {
  id: string;
  titulo: string;
  status: 'Em andamento' | 'Concluído' | 'Aguardando' | 'Suspenso';
  dataAtualizacao: string;
}

interface Estatistica {
  titulo: string;
  valor: string | number;
  icone: string;
  cor: string;
}

// Componente para mostrar cards de estatísticas
const EstatisticaCard = ({ titulo, valor, icone, cor }: Estatistica) => (
  <View style={[styles.estatisticaCard, { borderLeftColor: cor }]}>
    <View style={styles.iconeContainer}>
      <MaterialCommunityIcons name={icone as any} size={30} color={cor} />
    </View>
    <View style={styles.infoContainer}>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  </View>
);

// Componente para mostrar processos recentes
const ProcessoItem = ({ processo }: { processo: ProcessoResumo }) => {
  const statusCores = {
    'Em andamento': '#2196F3',
    'Concluído': '#4CAF50',
    'Aguardando': '#FFC107',
    'Suspenso': '#F44336',
  };

  return (
    <View style={styles.processoItem}>
      <View style={styles.processoHeader}>
        <Text style={styles.processoTitulo} numberOfLines={1}>{processo.titulo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusCores[processo.status as keyof typeof statusCores] }]}>
          <Text style={styles.statusText}>{processo.status}</Text>
        </View>
      </View>
      <Text style={styles.processoData}>Atualizado em: {processo.dataAtualizacao}</Text>
    </View>
  );
};

const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]);
  const [processosRecentes, setProcessosRecentes] = useState<ProcessoResumo[]>([]);
  
  const navigation = useNavigation();

  // Simulando dados de estatísticas
  useEffect(() => {
    const dadosEstatisticas: Estatistica[] = [
      { titulo: 'Processos Ativos', valor: 12, icone: 'gavel', cor: '#003366' },
      { titulo: 'Próximas Audiências', valor: 3, icone: 'calendar-clock', cor: '#0059b3' },
      { titulo: 'Clientes Ativos', valor: 42, icone: 'account-group', cor: '#007bff' },
      { titulo: 'Receita Mensal', valor: 'R$ 36.500', icone: 'currency-brl', cor: '#00aa00' },
    ];
    
    setEstatisticas(dadosEstatisticas);
    
    // Simulando dados de processos recentes
    const dadosProcessos: ProcessoResumo[] = [
      { id: '1', titulo: 'Processo Trabalhista - Silva vs Empresa X', status: 'Em andamento', dataAtualizacao: '18/09/2025' },
      { id: '2', titulo: 'Recursos Extraordinários - Recurso N° 123456', status: 'Aguardando', dataAtualizacao: '17/09/2025' },
      { id: '3', titulo: 'Divórcio Consensual - Pedido N° 789012', status: 'Concluído', dataAtualizacao: '15/09/2025' },
      { id: '4', titulo: 'Cobrança - Cliente Y', status: 'Em andamento', dataAtualizacao: '12/09/2025' },
      { id: '5', titulo: 'Ação Civil Pública - Meio Ambiente', status: 'Suspenso', dataAtualizacao: '10/09/2025' },
    ];
    
    setProcessosRecentes(dadosProcessos);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simular chamada para atualizar dados
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Bem-vindo de volta, Advogado!</Text>
        </View>

        {/* Estatísticas Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
          <View style={styles.estatisticasContainer}>
            {estatisticas.map((est, index) => (
              <EstatisticaCard 
                key={index}
                titulo={est.titulo}
                valor={est.valor}
                icone={est.icone}
                cor={est.cor}
              />
            ))}
          </View>
        </View>

        {/* Últimos Processos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Processos Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Processos')}>
              <Text style={styles.verMaisText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.processosContainer}>
            <FlatList
              data={processosRecentes}
              renderItem={({ item }) => <ProcessoItem processo={item} />}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Próximas audiências */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas Audiências</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Agenda')}>
              <Text style={styles.verMaisText}>Ver agenda</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.audienciasContainer}>
            <View style={styles.audienciaItem}>
              <View style={styles.audienciaHorario}>
                <Text style={styles.audienciaHora}>09:00</Text>
                <Text style={styles.audienciaDia}>Seg, 25 Set</Text>
              </View>
              <View style={styles.audienciaInfo}>
                <Text style={styles.audienciaTitulo}>Audiência Trabalhista - Silva vs Empresa X</Text>
                <Text style={styles.audienciaDetalhes}>Vara do Trabalho N° 1 - 3° Andar</Text>
              </View>
            </View>
            <View style={styles.audienciaItem}>
              <View style={styles.audienciaHorario}>
                <Text style={styles.audienciaHora}>14:30</Text>
                <Text style={styles.audienciaDia}>Qui, 26 Set</Text>
              </View>
              <View style={styles.audienciaInfo}>
                <Text style={styles.audienciaTitulo}>Audiência de Instrução - Recurso N° 123456</Text>
                <Text style={styles.audienciaDetalhes}>TJSP - 12° Andar - Sala 12</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Atalhos rápidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atalhos Rápidos</Text>
          <View style={styles.atalhosContainer}>
            <TouchableOpacity 
              style={styles.atalhoItem} 
              onPress={() => navigation.navigate('Processos', { screen: 'Adicionar' })}
            >
              <View style={styles.atalhoIcone}>
                <MaterialCommunityIcons name="file-document-edit" size={30} color="#003366" />
              </View>
              <Text style={styles.atalhoTexto}>Adicionar Processo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.atalhoItem} 
              onPress={() => navigation.navigate('Clientes', { screen: 'Adicionar' })}
            >
              <View style={styles.atalhoIcone}>
                <MaterialCommunityIcons name="account-plus" size={30} color="#003366" />
              </View>
              <Text style={styles.atalhoTexto}>Novo Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.atalhoItem} 
              onPress={() => navigation.navigate('Agenda', { screen: 'Adicionar' })}
            >
              <View style={styles.atalhoIcone}>
                <MaterialCommunityIcons name="calendar-plus" size={30} color="#003366" />
              </View>
              <Text style={styles.atalhoTexto}>Nova Audiência</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#003366',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  verMaisText: {
    color: '#0059b3',
    fontSize: 14,
  },
  estatisticasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  estatisticaCard: {
    backgroundColor: '#f8f9fa',
    width: (Dimensions.get('window').width - 50) / 2,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderRadius: 8,
    padding: 15,
  },
  iconeContainer: {
    alignSelf: 'flex-start',
  },
  infoContainer: {
    marginTop: 10,
  },
  valor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  titulo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  processosContainer: {
    flex: 1,
  },
  processoItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#003366',
  },
  processoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  processoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  processoData: {
    fontSize: 12,
    color: '#666',
  },
  audienciasContainer: {
    flex: 1,
  },
  audienciaItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
  },
  audienciaHorario: {
    marginRight: 15,
    alignItems: 'center',
  },
  audienciaHora: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  audienciaDia: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  audienciaInfo: {
    flex: 1,
  },
  audienciaTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  audienciaDetalhes: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },
  atalhosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  atalhoItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  atalhoIcone: {
    backgroundColor: '#e6f0ff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  atalhoTexto: {
    fontSize: 12,
    textAlign: 'center',
    color: '#003366',
  },
});

export default DashboardScreen;
