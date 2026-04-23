import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

    if (!form.email.trim()) {
      setError("El email es obligatorio.");
      return;
    }

    if (!form.password.trim()) {
      setError("La contraseña es obligatoria.");
      return;
    }

    try {
      setSubmitting(true);
      await login(form);
      toast.success("Sesión iniciada");
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || "No se pudo iniciar sesión.";

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
                <h1 className="page-title fs-2 mb-2">Iniciar sesión</h1>
                <p className="section-subtitle mb-4">
                  Entrá para administrar tus ingresos y gastos.
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                    {submitting ? "Ingresando..." : "Entrar"}
                  </button>
                </form>

                <p className="mt-4 mb-0 text-muted">
                  ¿No tenés cuenta? <Link to="/register">Registrate</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}