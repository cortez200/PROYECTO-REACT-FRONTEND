import { useEffect } from "react";

function App() {
  
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    console.log("URL del backend:", API_URL);

    fetch(`${API_URL}/api/usuarios`)
      .then(res => res.json())
      .then(data => console.log("Respuesta del backend:", data))
      .catch(err => console.error("Error llamando al backend:", err));
  }, []);

  return (
    <div>
      {/* tu código */}
    </div>
  );
}

export default App;
