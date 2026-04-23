import { useEffect, useState } from "react";
import {
  createCategoryRequest,
  deleteCategoryRequest,
  getCategoriesRequest,
  updateCategoryRequest,
} from "../../services/categoryService";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: 1,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesRequest();
        setCategories(data);
      } catch {
        setError("No se pudieron cargar las categorías.");
      }
    };

    fetchCategories();
  }, []);

  const reloadCategories = async () => {
    try {
      const data = await getCategoriesRequest();
      setCategories(data);
    } catch {
      setError("No se pudieron cargar las categorías.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "type" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: 1,
    });
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      setSubmitting(true);

      const wasEditing = !!editingId;

      const payload = {
        name: form.name.trim(),
        type: form.type,
      };

      if (editingId) {
        await updateCategoryRequest(editingId, payload);
      } else {
        await createCategoryRequest(payload);
      }

      resetForm();
      await reloadCategories();

      toast.success(
        wasEditing ? "Categoría actualizada" : "Categoría creada"
    );
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      "No se pudo guardar la categoría.";

    setError(message);
    toast.error(message);
  } finally {
    setSubmitting(false);
  }
};

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      type: category.type,
    });
    setEditingId(category.id);
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar esta categoría?"
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteCategoryRequest(id);

      if (editingId === id) {
        resetForm();
      }

      await reloadCategories();

      toast.success("Categoría eliminada");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "No se pudo eliminar la categoría.";

      setError(message);
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="page-title mb-1">Categorías</h1>
        <p className="section-subtitle mb-0">
          Organizá ingresos y gastos con categorías personalizadas.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
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
            <button className="btn btn-dark w-100" type="submit" disabled={submitting}>
              {submitting
                ? editingId
                  ? "Guardando..."
                  : "Creando..."
                : editingId
                ? "Guardar cambios"
                : "Agregar"}
            </button>
          </div>

          {editingId && (
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </form>

      <ul className="list-group">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center gap-2">
              <span>{cat.name}</span>
              <span
                className={`badge ${
                  cat.type === 1 ? "text-bg-success" : "text-bg-danger"
                }`}
              >
                {cat.type === 1 ? "Ingreso" : "Gasto"}
              </span>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEdit(cat)}
                title="Editar categoría"
              >
                ✏️ Editar
              </button>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(cat.id)}
                title="Eliminar categoría"
              >
                🗑 Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}