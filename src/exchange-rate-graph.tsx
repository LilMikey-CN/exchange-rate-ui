import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Define types for our data
interface ExchangeRateData {
  buying_rate: number;
  selling_rate: number;
  timestamp: string;
  formattedTime: string;
}

const CurrencyExchangeGraph = () => {
  const [exchangeData, setExchangeData] = useState<ExchangeRateData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch('http://180-one-glass.tech:8081/api/v1/aud-cny/boc/rates/last10');

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Format the data with the requested time format: MMM-DD HH:MM (24 hour format)
        const formattedData: ExchangeRateData[] = data
          .map((item: any) => {
            const date = new Date(item.timestamp);
            const month = date.toLocaleString('en-US', { month: 'short' });
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return {
              ...item,
              formattedTime: `${month}-${day} ${hours}:${minutes}`,
              buying_rate: parseFloat(item.buying_rate),
              selling_rate: parseFloat(item.selling_rate)
            };
          })
          .reverse(); // Reverse to show chronological order

        setExchangeData(formattedData);
        setIsLoading(false);

      } catch (err) {
        console.error('Error fetching exchange rate data:', err);
        setError('Failed to fetch exchange rate data. Please try again later.');
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

  // Calculate dynamic domain based on data
  const minRate = Math.floor(Math.min(
    ...exchangeData.map(item => item.buying_rate),
    ...exchangeData.map(item => item.selling_rate)
  ) * 0.998);

  const maxRate = Math.ceil(Math.max(
    ...exchangeData.map(item => item.buying_rate),
    ...exchangeData.map(item => item.selling_rate)
  ) * 1.002);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">CNY to AUD Exchange Rate</h1>
          <p className="text-gray-600 mb-6">Latest 10 records showing buying and selling rates</p>

          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={exchangeData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="formattedTime"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickSize={8}
                  tickMargin={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#6b7280' }}
                  tickSize={5}
                  tickMargin={8}
                  domain={[minRate, maxRate]}
                  label={{ value: 'Rate (CNY)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} CNY`, '']}
                  labelFormatter={(label) => `Date/Time: ${label}`}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="buying_rate"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#4338ca' }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  name="Buying Rate"
                />
                <Line
                  type="monotone"
                  dataKey="selling_rate"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#dc2626' }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  name="Selling Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 text-sm text-gray-500 p-2 bg-gray-50 rounded-lg">
            <p>• Blue line: Bank's buying rate (how much CNY you get when selling 100 AUD)</p>
            <p>• Red line: Bank's selling rate (how much CNY you need to buy 100 AUD)</p>
            <p>• Each point represents the exchange rate at a specific date and time</p>
            <p>• Hover over points to see exact values</p>
            <p>• Data source: Bank of China</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchangeGraph;
