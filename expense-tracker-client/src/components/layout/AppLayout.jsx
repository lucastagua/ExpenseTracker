import AppNavbar from "./AppNavbar";

export default function AppLayout({ children }) {
  return (
    <>
      <AppNavbar />
      <main className="container py-4">{children}</main>
    </>
  );
}