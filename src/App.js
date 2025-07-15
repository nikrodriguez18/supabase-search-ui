import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { saveAs } from 'file-saver';
import './App.css';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const searchTerms = query.split(';').map(term => term.trim().toLowerCase()).filter(Boolean);
    if (searchTerms.length === 0) return;

    let { data, error } = await supabase
      .from('NYSE2023')
      .select('*');

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    const filtered = data.filter(row =>
      searchTerms.some(term =>
        [row['CUSIP'], row['ISIN'], row['Symbol'], row['Issuer Name']].some(
          field => field && field.toLowerCase().includes(term)
        )
      )
    );

    setResults(filtered);
  };

  const handleExport = () => {
    const csv = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'search_results.csv');
  };

  return (
    <div className="App">
      <h1>Search NYSE 2023 Reference Data</h1>
      <div className="search-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Search by CUSIP, ISIN, Symbol, or Issuer (use ; to separate multiple)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
        <button className="export-button" onClick={handleExport}>Export to CSV</button>
      </div>
      <table className="results-table">
        <thead>
          <tr>
            {results.length > 0 &&
              Object.keys(results[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.entries(row).map(([key, value], colIndex) => (
                <td key={colIndex} style={{ color: key === 'Issuer Name' ? 'limegreen' : 'inherit' }}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
