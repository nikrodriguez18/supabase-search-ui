import React, { useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const searchableColumns = ['CUSIP', 'ISIN', 'Stock Symbol', 'Issuer Name']

  const handleSearch = async () => {
    const terms = query
      .split(';')
      .map((term) => term.trim())
      .filter((term) => term.length > 0)

    if (terms.length === 0) {
      setResults([])
      return
    }

    // Build OR conditions for each term and column
    const filters = terms
      .map((term) =>
        searchableColumns.map((col) => `"${col}".ilike.%${term}%`).join(',')
      )
      .join(',')

    const { data, error } = await supabase
      .from('NYSE2023')
      .select('*')
      .or(filters)

    if (error) {
      console.error('Search error:', error)
      setResults([])
    } else {
      setResults(data)
    }
  }

  const exportToCSV = () => {
    if (results.length === 0) return

    const headers = Object.keys(results[0])
    const csv = [
      headers.join(','),
      ...results.map((row) =>
        headers.map((field) => `"${(row[field] ?? '').toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'results.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e1e1e', minHeight: '100vh', color: '#eee' }}>
      <h2>Search NYSE 2023 Reference Data</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search by CUSIP, ISIN, Symbol, or Issuer (use ; to separate multiple entries)"
        style={{
          padding: '0.5rem',
          width: '400px',
          marginRight: '1rem',
          borderRadius: '4px',
          border: '1px solid #444',
          backgroundColor: '#2a2a2a',
          color: '#eee'
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: '#00ff80',
          color: '#1e1e1e',
          cursor: 'pointer',
          marginRight: '1rem'
        }}
      >
        Search
      </button>
      <button
        onClick={exportToCSV}
        disabled={results.length === 0}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: '#555',
          color: '#eee',
          cursor: results.length === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        Export to CSV
      </button>

      {results.length > 0 ? (
        <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {Object.keys({ 'Issuer Name': '', ...results[0] }).map((key) => (
                  <th
                    key={key}
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                      backgroundColor: '#2a2a2a',
                      color: '#ccc',
                      fontWeight: 'bold',
                      borderBottom: '1px solid #444',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => {
                const reorderedRow = { 'Issuer Name': row['Issuer Name'], ...row }
                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#262626'
                    }}
                  >
                    {Object.entries(reorderedRow).map(([key, val], i) => (
                      <td
                        key={i}
                        style={{
                          padding: '8px',
                          textAlign: 'center',
                          color: key === 'Issuer Name' ? '#00ff80' : '#eee',
                          whiteSpace: 'nowrap',
                          fontSize: '0.95rem'
                        }}
                      >
                        {val?.toString() ?? ''}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        query && <p style={{ marginTop: '2rem' }}>No results found.</p>
      )}
    </div>
  )
}

export default App
