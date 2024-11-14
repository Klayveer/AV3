import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async (date) => {
    setLoading(true);
    setError("");
    try {
      const formattedDate = date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
      const response = await axios.get(
        `http://127.0.0.1:5000/data?date=${formattedDate}`
      );
      setData(response.data);
    } catch (err) {
      setError("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      fetchData(date);
    }
  };

  return (
    <div>
      <h1>Dashboard de Reciclagem</h1>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="Selecione uma data"
      />

      {loading && <p>Carregando...</p>}
      {error && <p>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo Resíduo</th>
            <th>Peso</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.Data}</td>
              <td>{item["Tipo Resíduo"]}</td>
              <td>{item.Peso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;