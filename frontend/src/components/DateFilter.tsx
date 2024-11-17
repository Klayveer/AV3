import React, { useState } from 'react';

const DateFilter: React.FC = () => {
  const [date, setDate] = useState<string>('');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Filtrando por data:', date);
    // Aqui você pode fazer a chamada à API do backend com a data
  };

  return (
    <div>
      <label htmlFor="date">Escolha uma data:</label>
      <input type="date" id="date" value={date} onChange={handleDateChange} />
      <button onClick={handleSubmit}>Filtrar</button>
    </div>
  );
};

export default DateFilter;
