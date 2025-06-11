
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_GEMINI_API = '@LexProMobile:geminiApiKey';

const ConfigScreen: React.FC = () => {
    const [geminiApiKey, setGeminiApiKey] = useState<string>('');
    const [inputGeminiApiKey, setInputGeminiApiKey] = useState<string>('');

    // Carregar chave API do AsyncStorage ao montar o componente
    useEffect(() => {
        const loadApiKey = async () => {
            try {
                const storedKey = await AsyncStorage.getItem(STORAGE_KEY_GEMINI_API);
                if (storedKey !== null) {
                    setGeminiApiKey(storedKey);
                    setInputGeminiApiKey(storedKey); // Preenche o input com a chave carregada
                }
            } catch (error) {
                console.error('Erro ao carregar chave API do Gemini do AsyncStorage:', error);
                Alert.alert('Erro', 'Não foi possível carregar a chave API.');
            }
        };
        loadApiKey();
    }, []);

    const handleSaveApiKey = useCallback(async () => {
        const trimmedKey = inputGeminiApiKey.trim();
        if (!trimmedKey) {
            Alert.alert('Chave Inválida', 'A chave API do Gemini não pode estar vazia.');
            return;
        }
        try {
            await AsyncStorage.setItem(STORAGE_KEY_GEMINI_API, trimmedKey);
            setGeminiApiKey(trimmedKey); // Atualiza o estado interno para refletir a chave salva
            Alert.alert('Sucesso', 'Chave API do Gemini salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar chave API do Gemini no AsyncStorage:', error);
            Alert.alert('Erro', 'Não foi possível salvar a chave API.');
        }
    }, [inputGeminiApiKey]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={styles.container}>
                        <Text style={styles.header}>Configurar Chaves de API</Text>
                        <Text style={styles.description}>
                            Insira suas chaves de API para utilizar as funcionalidades de Inteligência Artificial.
                            As chaves são armazenadas localmente no seu dispositivo.
                        </Text>

                        <View style={styles.formSection}>
                            <Text style={styles.subHeader}>Google Gemini</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Sua Chave API do Google Gemini"
                                value={inputGeminiApiKey}
                                onChangeText={setInputGeminiApiKey}
                                placeholderTextColor="#888"
                                autoCapitalize="none"
                                secureTextEntry // Oculta a chave por padrão
                            />
                            <TouchableOpacity style={styles.button} onPress={handleSaveApiKey}>
                                <Text style={styles.buttonText}>Salvar Chave Gemini</Text>
                            </TouchableOpacity>
                             {geminiApiKey ? (
                                <Text style={styles.keyStatusText}>Chave Gemini configurada.</Text>
                            ) : (
                                <Text style={styles.keyStatusTextWarning}>Chave Gemini não configurada.</Text>
                            )}
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.subHeader}>OpenAI (ChatGPT)</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                placeholder="Em breve..."
                                editable={false}
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.subHeader}>Anthropic (Claude)</Text>
                             <TextInput
                                style={[styles.input, styles.disabledInput]}
                                placeholder="Em breve..."
                                editable={false}
                                placeholderTextColor="#aaa"
                            />
                        </View>
                         <Text style={styles.footerNote}>
                            Nota: Suas chaves de API são armazenadas de forma segura no seu dispositivo e não são compartilhadas.
                        </Text>
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
        paddingBottom: 20, // Espaço para o final do scroll
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: '#495057',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    formSection: {
        marginBottom: 25,
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
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
    },
    button: {
        backgroundColor: '#0059b3',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    keyStatusText: {
        marginTop: 10,
        fontSize: 14,
        color: 'green',
        textAlign: 'center',
    },
    keyStatusTextWarning: {
        marginTop: 10,
        fontSize: 14,
        color: '#dc3545',
        textAlign: 'center',
    },
    footerNote: {
        textAlign: 'center',
        fontSize: 13,
        color: '#6c757d',
        marginTop: 20,
        paddingHorizontal: 10,
    }
});

export default ConfigScreen;
