const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.get(`${API_URL}/usuarios`);

    // Buscar usuario por correo y password
    const usuario = res.data.find(
      (u) => u.correo === correo && u.password === password
    );

    if (!usuario) {
      setMensaje("❌ Credenciales incorrectas");
      return;
    }

    // Guardar usuario según rol
    if (usuario.tipo === "ADMIN") {
      localStorage.setItem("adminUsuario", JSON.stringify(usuario));
      navigate("/admin");
    } else {
      localStorage.setItem("pacienteUsuario", JSON.stringify(usuario));
      navigate("/paciente");
    }

    localStorage.setItem("usuario", JSON.stringify(usuario));
    setMensaje("✅ Inicio de sesión exitoso");

  } catch (error) {
    setMensaje("⚠️ Error al conectar con el servidor");
  }
};
