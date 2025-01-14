import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  color?: string;
}

export default function SkillChart({ data, color = "#FF8C21" }: BarChartProps) {
  const [compactScreen, setCompactScreen] = useState(false);
  // Update showLabels based on screen width
  useEffect(() => {
    const handleResize = () => {
      setCompactScreen(window.innerWidth < 775); // Show labels below 768px
    };

    // Initial check
    handleResize();

    // Add listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatXAxis = (value: string) => {
    return compactScreen ? value : '';
  }

  const formatYAxis = (value: number) => {
    if (value >= 90) return 'Expert';
    if (value >= 60) return 'Highly Proficient';
    return 'Proficient';
  }

  const renderBarLabel = (props: any) => {
    const { x, y, width, height, value, name } = props;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    return (
      <text
        x={centerX}
        y={centerY}  // Center in bar
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        transform={`rotate(-90, ${centerX}, ${centerY})`}
      >
        {`${name}`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={compactScreen ? 200 : 300}>
      <BarChart 
        data={data} 
        margin={{ 
          top: 20, 
          // right: 30, 
          left: compactScreen ? 10 : 70, 
          bottom: 5 
        }}
      >
        {/* Custom Grid */}
        {/* <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255,255,255,0.1)" 
          vertical={false}
        /> */}

        {/* X Axis */}
        <XAxis 
          dataKey="name"
          axisLine={true}  // Remove axis line
          tickLine={false}  // Remove tick lines
          tick={!compactScreen ? { 
            fill: 'white',
            fontSize: 14,
          } : false}
          dy={10}  // Adjust label position
        />

        {/* Y Axis */}
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fill: 'white',
            fontSize: '2.2vmin',
          }}
          tickFormatter={formatYAxis}
          ticks={[50, 75, 100]}
          domain={[40, 100]}
          // width={showLabels ? 60 : 110}
          dx={-10}
          // minWidth={60}
        />

        {/* Custom Tooltip */}
        {/* <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
          contentStyle={{ 
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          labelStyle={{
            color: 'white',
            fontWeight: 'bold',
            marginBottom: '4px'
          }}
          itemStyle={{
            color: color
          }}
        /> */}

        {/* Customized Bar */}
        <Bar 
          dataKey="value" 
          radius={[8, 8, 0, 0]}  // More rounded corners
          animationDuration={1000}
          animationBegin={200}
          label={compactScreen ? renderBarLabel : false}
        >
          {
            data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={color}
                fillOpacity={0.8}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                }}
              />
            ))
          }
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}