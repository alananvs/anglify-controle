import { useState } from "react";
import { useAuth } from "../hooks/index.js";
import { Spinner } from "../components/ui/index.jsx";

export default function LoginPage({ onSuccess }) {
  const { login }               = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message || "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login__logo">
          <div className="login__mark">A</div>
          <span className="login__appname">Anglify</span>
        </div>
        <h1 className="login__title">Bem-vindo de volta</h1>
        <p className="login__sub">Entre com seu e-mail para acessar o sistema</p>
        {error && <div className="login__error">{error}</div>}
        <div className="field">
          <label className="field__label">E-mail</label>
          <input className="field__input" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="seu@email.com" autoFocus />
        </div>
        <div className="field">
          <label className="field__label">Senha</label>
          <input className="field__input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••" />
        </div>
        <button className="btn btn--primary btn--full" style={{ marginTop: 8 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spinner white /> Entrando...</> : "Entrar"}
        </button>
        <div className="login__hint">
          <strong style={{ color: "var(--g600)" }}>Senha padrão:</strong> Anglify@2026
        </div>
      </div>
    </div>
  );
}
