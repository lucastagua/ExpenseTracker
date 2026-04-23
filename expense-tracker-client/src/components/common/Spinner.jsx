export default function Spinner({ text = "Cargando..." }) {
  return (
    <div className="d-flex flex-column align-items-center py-5">
      <div className="spinner-border text-dark mb-3" role="status" />
      <span className="text-muted">{text}</span>
    </div>
  );
}