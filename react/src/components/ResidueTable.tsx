import React, { useState, useEffect } from 'react';

interface Residue {
  date: string;
  residue_type: string;
  weight: string;
}

const ResidueTable: React.FC = () => {
  const [residues, setResidues] = useState<Residue[]>([]);

  useEffect(() => {
    // Aqui você pode fazer uma chamada para a API e carregar os resíduos
    fetch('/api/residuos')
      .then(response => response.json())
      .then(data => setResidues(data));
  }, []);

  return (
    <div>
      <h2>Lista de Resíduos</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo de Resíduo</th>
            <th>Peso</th>
          </tr>
        </thead>
        <tbody>
          {residues.map((residue, index) => (
            <tr key={index}>
              <td>{residue.date}</td>
              <td>{residue.residue_type}</td>
              <td>{residue.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResidueTable;
