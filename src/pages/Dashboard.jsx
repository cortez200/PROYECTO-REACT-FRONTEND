import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // 🔹 Si no hay token, lo mandamos al login
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // borrar token
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Bienvenido al Dashboard</h1>
      <p>Aquí podrás gestionar tus citas y recordatorios de medicinas.</p>

      <button
        onClick={handleLogout}
        style={{
          background: "#009fe3",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          marginTop: "20px",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
