import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CurrencyExchangeGraph = () => {
  const [exchangeData, setExchangeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://180-one-glass.tech:8081/api/v1/aud-cny/boc/rates/last10');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform data if needed and reverse to show chronological order
        const formattedData = data
          .map(item => ({
            ...item,
            date: new Date(item.timestamp).toLocaleDateString(),
            rate: parseFloat(item.rate)
          }))
          .reverse();
        
        setExchangeData(formattedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching exchange rate data:', err);
        setError('Failed to load exchange rate data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-500 font-medium">Loading exchange rate data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">CNY to AUD Exchange Rate</h1>
          <p className="text-gray-600 mb-6">Latest 10 records showing exchange rate trend</p>
          
          <div className="h-64 md:h-80 w-full animate-fadeIn">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={exchangeData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date"
                  tick={{ fill: '#6b7280' }}
                  tickSize={10}
                  tickMargin={8}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }}
                  tickSize={5}
                  tickMargin={8}
                  domain={['auto', 'auto']}
                  label={{ value: 'Rate (CNY)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  formatter={(value) => [`${value.toFixed(4)} CNY`, 'Rate']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#4338ca' }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  name="Exchange Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 p-2 bg-gray-50 rounded-lg">
            <p>• Each point represents the exchange rate on that specific date</p>
            <p>• Hover over points to see exact values</p>
            <p>• Data source: Bank of China</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchangeGraph;
