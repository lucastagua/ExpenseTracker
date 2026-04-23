export default function EmptyState({ text = "No hay datos." }) {
  return (
    <div className="text-center py-5 text-muted">
      <div style={{ fontSize: "2rem" }}>📭</div>
      <div>{text}</div>
    </div>
  );
}