const Admin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
      <div className="relative z-10 p-8 rounded-2xl shadow-xl max-w-md w-full border border-[var(--border)] bg-[var(--surface)]">
        <h2 className="text-2xl font-semibold mb-2 text-[var(--text)]">Админ-панель</h2>
        <p className="text-[var(--text-muted)]">Только для пользователей с ролью admin.</p>
      </div>
    </div>
  );
}

export default Admin;


