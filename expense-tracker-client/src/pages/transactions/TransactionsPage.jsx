import { useEffect, useMemo, useState } from "react";
import { getCategoriesRequest } from "../../services/categoryService";
import {
  createTransactionRequest,
  deleteTransactionRequest,
  getTransactionsRequest,
  updateTransactionRequest,
} from "../../services/transactionService";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    type: 2,
    notes: "",
    categoryId: "",
  });

  const [filters, setFilters] = useState({
    type: "",
    categoryId: "",
    fromDate: "",
    toDate: "",
    pageNumber: 1,
    pageSize: 5,
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === Number(form.type));
  }, [categories, form.type]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value ?? 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesRequest();
        setCategories(data ?? []);
      } catch {
        setPageError("No se pudieron cargar las categorías.");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setPageError("");

        const data = await getTransactionsRequest({
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize,
          type: filters.type || undefined,
          categoryId: filters.categoryId || undefined,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
        });

        setTransactions(data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch {
        setPageError("No se pudieron cargar las transacciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  const reloadTransactions = async () => {
    try {
      setPageError("");

      const data = await getTransactionsRequest({
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
        type: filters.type || undefined,
        categoryId: filters.categoryId || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });

      setTransactions(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setPageError("No se pudieron cargar las transacciones.");
    }
  };

  const resetForm = () => {
    setForm({
      description: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      type: 2,
      notes: "",
      categoryId: "",
    });
    setEditingId(null);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setForm((prev) => ({
        ...prev,
        type: Number(value),
        categoryId: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "categoryId"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      pageNumber: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      categoryId: "",
      fromDate: "",
      toDate: "",
      pageNumber: 1,
      pageSize: 5,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFormError("");

  if (!form.description.trim()) {
    setFormError("La descripción es obligatoria.");
    return;
  }

  if (!form.amount || Number(form.amount) <= 0) {
    setFormError("El monto debe ser mayor a 0.");
    return;
  }

  if (!form.date) {
    setFormError("La fecha es obligatoria.");
    return;
  }

  if (!form.categoryId) {
    setFormError("Seleccioná una categoría.");
    return;
  }

  try {
    setSubmitting(true);

    const wasEditing = !!editingId;

    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      date: `${form.date}T00:00:00`,
      type: Number(form.type),
      notes: form.notes.trim(),
      categoryId: Number(form.categoryId),
    };

    if (editingId) {
      await updateTransactionRequest(editingId, payload);
    } else {
      await createTransactionRequest(payload);
    }

    resetForm();
    await reloadTransactions();

    toast.success(
      wasEditing
        ? "Transacción actualizada"
        : "Transacción creada"
    );
  } catch (err) {
    console.log("ERROR SAVE TRANSACTION:", err?.response?.data);

    const apiError = err?.response?.data;

    let message = "No se pudo guardar la transacción.";

    if (apiError?.errors) {
      message = Object.values(apiError.errors)?.flat()?.[0] || message;
    } else if (apiError?.message) {
      message = apiError.message;
    }

    setFormError(message);
    toast.error(message);
  } finally {
    setSubmitting(false);
  }
  };

  const handleEdit = (transaction) => {
    setForm({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date.slice(0, 10),
      type: transaction.type,
      notes: transaction.notes || "",
      categoryId: transaction.categoryId,
    });

    setEditingId(transaction.id);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar esta transacción?"
    );

    if (!confirmed) return;

    setPageError("");

    try {
      await deleteTransactionRequest(id);

      if (editingId === id) {
        resetForm();
      }

      await reloadTransactions();

      toast.success("Transacción eliminada");
    } catch (err) {
      setPageError(
        err?.response?.data?.message ||
          "No se pudo eliminar la transacción."
      );
      toast.error("No se pudo eliminar la transacción");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="page-title mb-1">Transacciones</h1>
        <p className="section-subtitle mb-0">
          Registrá, editá y filtrá tus movimientos financieros.
        </p>
      </div>

      {pageError && <div className="alert alert-danger">{pageError}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            {editingId ? "Editar transacción" : "Nueva transacción"}
          </h5>

          {formError && <div className="alert alert-danger">{formError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Descripción</label>
                <input
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Ej: Compra supermercado"
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Monto</label>
                <input
                  className="form-control"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Fecha</label>
                <input
                  className="form-control"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Tipo</label>
                <select
                  className="form-select"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value={1}>Ingreso</option>
                  <option value={2}>Gasto</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Notas</label>
                <textarea
                  className="form-control"
                  name="notes"
                  rows="2"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-dark" type="submit" disabled={submitting}>
                  {submitting
                    ? editingId
                      ? "Guardando..."
                      : "Creando..."
                    : editingId
                    ? "Guardar cambios"
                    : "Guardar transacción"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Filtros</h5>

          <div className="row g-3">
            <div className="col-md-2">
              <select
                className="form-select"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="1">Ingreso</option>
                <option value="2">Gasto</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Listado</h5>

          {loading ? (
            <div className="empty-state">Cargando transacciones...</div>
          ) : transactions.length === 0 ? (
            <EmptyState text="No hay transacciones para mostrar." />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Tipo</th>
                      <th>Categoría</th>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="fw-semibold">{t.description}</div>
                          {t.notes && (
                            <div className="text-muted small">{t.notes}</div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              t.type === 1 ? "text-bg-success" : "text-bg-danger"
                            }`}
                          >
                            {t.type === 1 ? "Ingreso" : "Gasto"}
                          </span>
                        </td>
                        <td>{t.categoryName}</td>
                        <td>{new Date(t.date).toLocaleDateString("es-AR")}</td>
                        <td className={t.type === 1 ? "amount-income" : "amount-expense"}>
                          {formatCurrency(t.amount)}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(t)}
                              title="Editar transacción"
                            >
                              ✏️ Editar
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(t.id)}
                              title="Eliminar transacción"
                            >
                              🗑 Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-outline-dark"
                  disabled={filters.pageNumber === 1}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      pageNumber: prev.pageNumber - 1,
                    }))
                  }
                >
                  Anterior
                </button>

                <span>
                  Página {filters.pageNumber} de {totalPages}
                </span>

                <button
                  className="btn btn-outline-dark"
                  disabled={filters.pageNumber >= totalPages}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      pageNumber: prev.pageNumber + 1,
                    }))
                  }
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}