import React, { useState } from 'react';

// Feriados Nacionais Fixos (formato MM-DD)
const feriadosNacionaisFixos: string[] = [
    '01-01', // Confraternização Universal
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalho
    '09-07', // Independência do Brasil
    '10-12', // Nossa Senhora Aparecida (Padroeira do Brasil)
    '11-02', // Finados
    '11-15', // Proclamação da República
    '12-25', // Natal
];

const CalculadoraPrazos: React.FC = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [days, setDays] = useState<string>('');
    const [countingType, setCountingType] = useState<'corridos' | 'uteis'>('uteis');
    const [resultDate, setResultDate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isWeekend = (date: Date): boolean => {
        const day = date.getDay();
        return day === 0 || day === 6; // 0 para Domingo, 6 para Sábado
    };

    const isFeriado = (date: Date): boolean => {
        // Formata o mês e o dia com zero à esquerda se necessário (ex: 01, 09)
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const dayOfMonth = date.getDate().toString().padStart(2, '0');
        return feriadosNacionaisFixos.includes(`${month}-${dayOfMonth}`);
    };

    const handleCalcularPrazo = () => {
        setResultDate(null);
        setError(null);

        if (!startDate) {
            setError("Por favor, informe a data de início.");
            return;
        }

        const prazoEmDias = parseInt(days);
        if (isNaN(prazoEmDias) || prazoEmDias <= 0) {
            setError("Por favor, informe uma quantidade de dias válida (número positivo).");
            return;
        }

        // Parse da data de início. Formato YYYY-MM-DD
        const [year, month, dayOfMonth] = startDate.split('-').map(Number);
        // new Date() usa mês 0-indexado, então subtraímos 1 do mês.
        let currentDate = new Date(year, month - 1, dayOfMonth);

        let diasContados = 0;
        let diasIterados = 0;
        // Limite de segurança para evitar loops infinitos em cenários inesperados.
        // Uma heurística: prazo * 7 (para cobrir semanas) + 30 (folga para feriados).
        const maxIteracoes = prazoEmDias * 7 + 30;

        while (diasContados < prazoEmDias && diasIterados < maxIteracoes) {
            // Avança para o dia seguinte para iniciar a contagem
            currentDate.setDate(currentDate.getDate() + 1);
            diasIterados++;

            if (countingType === 'uteis') {
                if (isWeekend(currentDate) || isFeriado(currentDate)) {
                    continue; // Pula fins de semana e feriados
                }
            }
            diasContados++;
        }
        
        if (diasIterados >= maxIteracoes) {
            setError("O cálculo excedeu o número máximo de iterações. Verifique as entradas ou a lista de feriados.");
            return;
        }

        const diaSemana = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
        const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        const dataFinalFormatada = currentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        setResultDate(`O prazo final é ${dataFinalFormatada} (${diaSemanaCapitalizado})`);
    };

    return (
        <div className="card"> {/* Utiliza classe global .card */}
            <h2>Calculadora de Prazos Processuais</h2>
            <div className="form-section"> {/* Utiliza classe global .form-section */}
                <div className="form-group"> {/* Utiliza classe global .form-group */}
                    <label htmlFor="prazoStartDate">Data de Início da Contagem (Publicação):</label>
                    <input
                        type="date"
                        id="prazoStartDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        aria-required="true"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="prazoDays">Quantidade de Dias do Prazo:</label>
                    <input
                        type="number"
                        id="prazoDays"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        placeholder="Ex: 15"
                        min="1"
                        aria-required="true"
                    />
                </div>

                <div className="form-group">
                    <label>Tipo de Contagem:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '5px' }}>
                        <label htmlFor="diasUteis" style={{ fontWeight: 'normal', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                id="diasUteis"
                                name="countingType"
                                value="uteis"
                                checked={countingType === 'uteis'}
                                onChange={() => setCountingType('uteis')}
                                style={{ marginRight: '5px' }}
                            />
                            Dias Úteis
                        </label>
                        <label htmlFor="diasCorridos" style={{ fontWeight: 'normal', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                id="diasCorridos"
                                name="countingType"
                                value="corridos"
                                checked={countingType === 'corridos'}
                                onChange={() => setCountingType('corridos')}
                                style={{ marginRight: '5px' }}
                            />
                            Dias Corridos
                        </label>
                    </div>
                </div>

                <button onClick={handleCalcularPrazo} className="btn-primary" style={{ marginTop: '10px' }}> {/* Utiliza classe global .btn-primary */}
                    Calcular Prazo Final
                </button>

                {error && (
                    <div style={{ marginTop: '15px', color: '#dc3545', fontWeight: 'bold', padding: '10px', border: '1px solid #f5c6cb', borderRadius: '4px', backgroundColor: '#f8d7da' }} role="alert">
                        {error}
                    </div>
                )}

                {resultDate && !error && (
                    <div className="result-display" style={{ marginTop: '15px' }} role="status"> {/* Utiliza classe global .result-display */}
                        {resultDate}
                    </div>
                )}
                 <p style={{ fontSize: '0.9em', marginTop: '20px', color: '#6c757d' }}>
                    <strong>Nota:</strong> Para contagem em dias úteis, são considerados os seguintes feriados nacionais fixos (formato MM-DD): {feriadosNacionaisFixos.join(', ')}.
                    Esta calculadora não considera feriados estaduais, municipais, pontos facultativos ou alterações no calendário forense. Sempre confirme os prazos com as publicações oficiais.
                </p>
            </div>
            {/* Outras seções da Calculadora de Prazos podem ser adicionadas aqui, se necessário */}
        </div>
    );
};

export default CalculadoraPrazos;