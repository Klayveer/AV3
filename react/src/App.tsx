import React from 'react';
import DateFilter from './components/DateFilter';
import MonthFilter from './components/MonthFilter';
import ResidueTable from './components/ResidueTable';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>RECICLAME.ME - Gerenciamento de Resíduos</h1>
      <DateFilter />
      <MonthFilter />
      <ResidueTable />
    </div>
  );
}

export default App;
