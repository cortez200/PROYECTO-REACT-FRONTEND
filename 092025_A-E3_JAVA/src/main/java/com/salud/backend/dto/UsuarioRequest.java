package com.salud.backend.dto;



public class UsuarioRequest {

    private String nombre;
    private String correo;
    private String password;
    private String tipo; // PACIENTE, FAMILIAR, ADMIN

    public UsuarioRequest() {}

    public UsuarioRequest(String nombre, String correo, String password, String tipo) {
        this.nombre = nombre;
        this.correo = correo;
        this.password = password;
        this.tipo = tipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
