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
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value ?? 0);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthName" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
        <Bar
          dataKey="totalIncome"
          name="Ingresos"
          fill="#198754"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="totalExpense"
          name="Gastos"
          fill="#dc3545"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}