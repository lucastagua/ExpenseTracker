import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordRequest } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await forgotPasswordRequest(email.trim());

      setMessage(data.message || "Si el email existe, se enviará un enlace.");
      toast.success("Solicitud enviada");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "No se pudo procesar la solicitud.";

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
                <h1 className="page-title fs-2 mb-2">Recuperar contraseña</h1>
                <p className="section-subtitle mb-4">
                  Ingresá tu email y te enviaremos un enlace para restablecerla.
                </p>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn btn-dark w-100 py-2"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Enviando..." : "Enviar enlace"}
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