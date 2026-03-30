import { useEffect, useState } from "react";
import {
  createCategoryRequest,
  deleteCategoryRequest,
  getCategoriesRequest,
  updateCategoryRequest,
} from "../../services/categoryService";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        const updatedCategory = await updateCategoryRequest(editingId, form);

        setCategories((prev) =>
          prev.map((cat) => (cat.id === editingId ? updatedCategory : cat))
        );
      } else {
        const newCategory = await createCategoryRequest(form);
        setCategories((prev) => [...prev, newCategory]);
      }

      resetForm();
    } catch (err) {
      setError(
        err?.response?.data?.message || "No se pudo guardar la categoría."
      );
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
    const confirmed = window.confirm("¿Seguro que querés eliminar esta categoría?");
    if (!confirmed) return;

    setError("");

    try {
      await deleteCategoryRequest(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "No se pudo eliminar la categoría."
      );
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
            <button className="btn btn-dark w-100" type="submit">
              {editingId ? "Guardar cambios" : "Agregar"}
            </button>
          </div>

          {editingId && (
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={resetForm}
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
            <span>
              <div className="d-flex align-items-center gap-2">
                <span>{cat.name}</span>
                <span className={`badge ${cat.type === 1 ? "text-bg-success" : "text-bg-danger"}`}>
                  {cat.type === 1 ? "Ingreso" : "Gasto"}
                </span>
              </div>
            </span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEdit(cat)}
              >
                Editar
              </button>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(cat.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}