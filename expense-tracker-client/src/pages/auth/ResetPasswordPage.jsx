import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordRequest } from "../../services/authService";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.newPassword.trim()) {
      setError("La nueva contraseña es obligatoria.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);

      await resetPasswordRequest(token, form.newPassword);

      toast.success("Contraseña actualizada");
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "No se pudo restablecer la contraseña.";

      setError(msg);
      toast.error(msg);
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
                <h1 className="page-title fs-2 mb-2">Nueva contraseña</h1>
                <p className="section-subtitle mb-4">
                  Ingresá tu nueva contraseña para recuperar el acceso.
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nueva contraseña</label>
                    <input
                      className="form-control"
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Confirmar contraseña</label>
                    <input
                      className="form-control"
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    className="btn btn-dark w-100 py-2"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Guardando..." : "Guardar contraseña"}
                  </button>
                </form>

                <p className="mt-4 mb-0 text-muted">
                  <Link to="/login">Volver al login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}