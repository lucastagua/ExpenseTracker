import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MonthlyHistoryChart({ data }) {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalIncome" name="Ingresos" />
          <Bar dataKey="totalExpense" name="Gastos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}