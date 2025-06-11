
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

// Interface para tipagem dos dados do Cliente
interface Cliente {
    id: string;
    nome: string;
    cpfCnpj: string;
    email: string;
    telefone: string;
    endereco: string;
}

// Chave para AsyncStorage
const STORAGE_KEY_CLIENTES = '@LexProMobile:clientes';

const ClientesScreen: React.FC = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [novoCliente, setNovoCliente] = useState<Omit<Cliente, 'id'>>({
        nome: '',
        cpfCnpj: '',
        email: '',
        telefone: '',
        endereco: ''
    });

    // Carregar clientes do AsyncStorage ao montar o componente
    useEffect(() => {
        const loadClientes = async () => {
            try {
                const storedClientes = await AsyncStorage.getItem(STORAGE_KEY_CLIENTES);
                if (storedClientes !== null) {
                    setClientes(JSON.parse(storedClientes));
                }
            } catch (error) {
                console.error('Erro ao carregar clientes do AsyncStorage:', error);
                Alert.alert('Erro', 'Não foi possível carregar os dados dos clientes.');
            }
        };
        loadClientes();
    }, []);

    // Salvar clientes no AsyncStorage sempre que a lista de clientes mudar
    useEffect(() => {
        const saveClientes = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));
            } catch (error) { // Added curly braces for the catch block
                console.error('Erro ao salvar clientes no AsyncStorage:', error);
                // Não vamos mostrar um Alert aqui para não ser intrusivo a cada salvamento
            }
        };
        // The original condition `if (clientes.length > 0 || AsyncStorage.getItem(STORAGE_KEY_CLIENTES) !== null)`
        // was flawed because AsyncStorage.getItem returns a Promise, which is always truthy (not null).
        // This meant `saveClientes()` was effectively always called if the useEffect triggered.
        // Simplest is to call it directly.
        saveClientes();
    }, [clientes]);

    const handleClienteInputChange = useCallback((fieldName: keyof Omit<Cliente, 'id'>, value: string) => {
        setNovoCliente(prev => ({ ...prev, [fieldName]: value }));
    }, []);

    const handleSubmitClienteForm = useCallback(() => {
        if (!novoCliente.nome.trim()) {
            Alert.alert('Campo Obrigatório', 'O nome do cliente é obrigatório.');
            return;
        }

        const clienteComId: Cliente = {
            ...novoCliente,
            id: new Date().toISOString() // Gera um ID único simples
        };

        setClientes(prevClientes => [clienteComId, ...prevClientes]); // Adiciona no início da lista
        setNovoCliente({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '' }); // Limpa o formulário
        Alert.alert('Sucesso', 'Cliente adicionado com sucesso!');
    }, [novoCliente]); // setClientes and setNovoCliente are stable and don't need to be in deps.

    const renderClienteItem = ({ item }: { item: Cliente }) => (
        <View style={styles.listItem}>
            <Text style={styles.listItemTextStrong}>{item.nome}</Text>
            {item.cpfCnpj ? <Text style={styles.listItemText}>CPF/CNPJ: {item.cpfCnpj}</Text> : null}
            {item.email ? <Text style={styles.listItemText}>Email: {item.email}</Text> : null}
            {item.telefone ? <Text style={styles.listItemText}>Telefone: {item.telefone}</Text> : null}
            {item.endereco ? <Text style={styles.listItemText}>Endereço: {item.endereco}</Text> : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={styles.container}>
                        <Text style={styles.header}>Gestão de Clientes</Text>

                        <View style={styles.formSection}>
                            <Text style={styles.subHeader}>Adicionar Novo Cliente</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome Completo *"
                                value={novoCliente.nome}
                                onChangeText={(text) => handleClienteInputChange('nome', text)}
                                placeholderTextColor="#888"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="CPF/CNPJ"
                                value={novoCliente.cpfCnpj}
                                onChangeText={(text) => handleClienteInputChange('cpfCnpj', text)}
                                keyboardType="default"
                                placeholderTextColor="#888"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="E-mail"
                                value={novoCliente.email}
                                onChangeText={(text) => handleClienteInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#888"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Telefone"
                                value={novoCliente.telefone}
                                onChangeText={(text) => handleClienteInputChange('telefone', text)}
                                keyboardType="phone-pad"
                                placeholderTextColor="#888"
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Endereço"
                                value={novoCliente.endereco}
                                onChangeText={(text) => handleClienteInputChange('endereco', text)}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity style={styles.button} onPress={handleSubmitClienteForm}>
                                <Text style={styles.buttonText}>Adicionar Cliente</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.listSection}>
                            <Text style={styles.subHeader}>Clientes Cadastrados</Text>
                            {clientes.length === 0 ? (
                                <Text style={styles.emptyListText}>Nenhum cliente cadastrado.</Text>
                            ) : (
                                <FlatList
                                    data={clientes}
                                    renderItem={renderClienteItem}
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
    textArea: {
        height: 80,
        textAlignVertical: 'top', // Para Android
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
        flex: 1, // Para que a lista ocupe o espaço restante se necessário
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
        borderLeftColor: '#0059b3',
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

export default ClientesScreen;
