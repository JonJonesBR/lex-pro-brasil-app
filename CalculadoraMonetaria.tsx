
import React, { useState } from 'react';

const CalculadoraMonetaria: React.FC = () => {
    const [valorOriginal, setValorOriginal] = useState<string>('');
    const [dataInicial, setDataInicial] = useState<string>('');
    const [dataFinal, setDataFinal] = useState<string>('');
    const [indice, setIndice] = useState<string>('IPCA-E');
    const [resultado, setResultado] = useState<string | null>(null);

    const handleCalcularAtualizacao = () => {
        const valor = parseFloat(valorOriginal);
        if (isNaN(valor) || valor <= 0) {
            alert("Por favor, insira um valor original válido.");
            setResultado(null);
            return;
        }

        let fator = 1.0;
        switch (indice) {
            case 'IPCA-E': fator = 1.15; break;
            case 'INPC': fator = 1.12; break;
            case 'IGP-M': fator = 1.20; break;
            case 'TR': fator = 1.05; break;
            case 'Selic': fator = 1.18; break;
            default: fator = 1.0;
        }
        if (dataInicial.includes("2020") && dataFinal.includes("2023")) fator += 0.05;
        const calculatedResult = valor * fator;
        setResultado(`R$ ${calculatedResult.toFixed(2).replace('.', ',')}`);
    };

    return (
        <div className="card">
            <h2>Calculadoras Jurídicas</h2>
            <div className="form-section">
                <h3>Calculadora de Atualização Monetária (Simulada)</h3>
                <div className="form-group">
                    <label htmlFor="calcValorOriginal">Valor Original (R$):</label>
                    <input type="number" id="calcValorOriginal" value={valorOriginal} onChange={e => setValorOriginal(e.target.value)} placeholder="Ex: 1000.00" />
                </div>
                <div className="form-group">
                    <label htmlFor="calcDataInicial">Data Inicial (texto):</label>
                    <input type="text" id="calcDataInicial" value={dataInicial} onChange={e => setDataInicial(e.target.value)} placeholder="Ex: 01/01/2020" />
                </div>
                <div className="form-group">
                    <label htmlFor="calcDataFinal">Data Final (texto):</label>
                    <input type="text" id="calcDataFinal" value={dataFinal} onChange={e => setDataFinal(e.target.value)} placeholder="Ex: 31/12/2023" />
                </div>
                <div className="form-group">
                    <label htmlFor="calcIndice">Índice (Simulado):</label>
                    <select id="calcIndice" value={indice} onChange={e => setIndice(e.target.value)}>
                        <option value="IPCA-E">IPCA-E (simulado +15%)</option>
                        <option value="INPC">INPC (simulado +12%)</option>
                        <option value="IGP-M">IGP-M (simulado +20%)</option>
                        <option value="TR">TR (simulado +5%)</option>
                        <option value="Selic">Selic (simulado +18%)</option>
                    </select>
                </div>
                <button onClick={handleCalcularAtualizacao} className="btn-primary">Calcular Atualização</button>
                {resultado && (
                    <div className="result-display" aria-live="polite">
                        Resultado Simulado: {resultado}
                    </div>
                )}
                <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#6c757d' }}>Nota: Esta é uma simulação com fatores fixos. Datas apenas textuais e não influenciam precisamente o cálculo nesta versão.</p>
            </div>
            <hr />
            <h4>Outras Calculadoras (descritivo):</h4>
            <ul>
                <li>Calculadora de Horas Extras e Verbas Rescisórias (Trabalhista)</li>
                <li>Calculadora de Custas Processuais</li>
            </ul>
            <p><em>(As demais calculadoras ainda são descritivas.)</em></p>
        </div>
    );
};

export default CalculadoraMonetaria;
