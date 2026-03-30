import { useEffect, useState } from "react";
import {
  getMonthlyHistoryRequest,
  getMonthlySummaryRequest,
  getSummaryRequest,
} from "../../services/dashboardService";
import MonthlyHistoryChart from "../../components/common/MonthlyHistoryChart";
import ExpensesPieChart from "../../components/common/ExpensesPieChart";

export default function DashboardPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [summary, setSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [error, setError] = useState("");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value ?? 0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryData, monthlySummaryData, monthlyHistoryData] =
          await Promise.all([
            getSummaryRequest(),
            getMonthlySummaryRequest(currentYear, currentMonth),
            getMonthlyHistoryRequest(currentYear),
          ]);

        setSummary(summaryData);
        setMonthlySummary(monthlySummaryData);
        setMonthlyHistory(monthlyHistoryData);
      } catch {
        setError("No se pudo cargar el dashboard.");
      }
    };

    loadDashboard();
  }, [currentYear, currentMonth]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!summary || !monthlySummary) {
    return <div className="container py-4">Cargando dashboard...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="page-title mb-1">Dashboard</h1>
        <p className="section-subtitle mb-0">
          Resumen general, actividad reciente y evolución mensual.
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card metric-card metric-income h-100">
            <div className="card-body">
              <div className="metric-label">Ingresos totales</div>
              <p className="metric-value amount-income">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card metric-card metric-expense h-100">
            <div className="card-body">
              <div className="metric-label">Gastos totales</div>
              <p className="metric-value amount-expense">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card metric-card metric-balance h-100">
            <div className="card-body">
              <div className="metric-label">Balance</div>
              <p className="metric-value amount-balance">
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card metric-card metric-count h-100">
            <div className="card-body">
              <div className="metric-label">Transacciones</div>
              <p className="metric-value">{summary.transactionsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="soft-card p-4 mb-4">
        <h5 className="card-title-pro mb-3">
          Resumen mensual ({monthlySummary.month}/{monthlySummary.year})
        </h5>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="border rounded-4 p-3 h-100">
              <div className="metric-label">Ingresos del mes</div>
              <p className="metric-value amount-income fs-3">
                {formatCurrency(monthlySummary.totalIncome)}
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border rounded-4 p-3 h-100">
              <div className="metric-label">Gastos del mes</div>
              <p className="metric-value amount-expense fs-3">
                {formatCurrency(monthlySummary.totalExpense)}
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border rounded-4 p-3 h-100">
              <div className="metric-label">Balance del mes</div>
              <p className="metric-value amount-balance fs-3">
                {formatCurrency(monthlySummary.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-7">
          <div className="soft-card p-4 h-100">
            <h5 className="card-title-pro mb-3">Ingresos vs gastos por mes</h5>
            <MonthlyHistoryChart data={monthlyHistory} />
          </div>
        </div>

        <div className="col-xl-5">
          <div className="soft-card p-4 h-100">
            <h5 className="card-title-pro mb-3">Gastos por categoría del mes</h5>
            <ExpensesPieChart data={monthlySummary.expensesByCategory} />
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-6">
          <div className="soft-card p-4 h-100">
            <h5 className="card-title-pro mb-3">Movimientos recientes</h5>

            {summary.recentTransactions.length === 0 ? (
              <div className="empty-state">No hay movimientos recientes.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {summary.recentTransactions.map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex justify-content-between align-items-center px-0"
                  >
                    <div>
                      <div className="fw-semibold">{item.description}</div>
                      <div className="text-muted small">
                        {item.categoryName} · {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-end">
                      <div className={item.type === 1 ? "amount-income" : "amount-expense"}>
                        {formatCurrency(item.amount)}
                      </div>
                      <div>
                        <span className={`badge ${item.type === 1 ? "text-bg-success" : "text-bg-danger"}`}>
                          {item.type === 1 ? "Ingreso" : "Gasto"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="col-xl-6">
          <div className="soft-card p-4 h-100">
            <h5 className="card-title-pro mb-3">Historial mensual ({currentYear})</h5>

            {monthlyHistory.length === 0 ? (
              <div className="empty-state">No hay historial mensual.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Ingresos</th>
                      <th>Gastos</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyHistory.map((item) => (
                      <tr key={item.month}>
                        <td className="text-capitalize fw-semibold">{item.monthName}</td>
                        <td className="amount-income">{formatCurrency(item.totalIncome)}</td>
                        <td className="amount-expense">{formatCurrency(item.totalExpense)}</td>
                        <td className="amount-balance">{formatCurrency(item.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}