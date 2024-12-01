import React, { useState } from 'react';

const MonthFilter: React.FC = () => {
  const [month, setMonth] = useState<string>('');

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Filtrando por mês:', month);
    // Aqui você pode fazer a chamada à API do backend com o mês
  };

  return (
    <div>
      <label htmlFor="month">Escolha um mês:</label>
      <input type="month" id="month" value={month} onChange={handleMonthChange} />
      <button onClick={handleSubmit}>Filtrar</button>
    </div>
  );
};

export default MonthFilter;
