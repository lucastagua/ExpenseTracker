import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!form.email.trim()) {
      setError("El email es obligatorio.");
      return;
    }

    if (!form.password.trim()) {
      setError("La contraseña es obligatoria.");
      return;
    }

    if (form.password.trim().length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      await register(form);
      toast.success("Cuenta creada correctamente");
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || "No se pudo registrar.";

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card">
              <div className="card-body p-4 p-md-5">
                <h1 className="page-title fs-2 mb-2">Crear cuenta</h1>
                <p className="section-subtitle mb-4">
                  Empezá a registrar y analizar tus finanzas.
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Contraseña</label>
                    <input
                      className="form-control"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    className="btn btn-dark w-100 py-2"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Creando cuenta..." : "Registrarme"}
                  </button>
                </form>

                <p className="mt-4 mb-0 text-muted">
                  ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}