package com.salud.backend.dto;

public class MarcarTomaRequest {

    private boolean tomado;

    // ✅ Constructor vacío
    public MarcarTomaRequest() {}

    // ✅ Constructor con parámetro (opcional)
    public MarcarTomaRequest(boolean tomado) {
        this.tomado = tomado;
    }

    // ✅ Getter y Setter
    public boolean isTomado() {
        return tomado;
    }

    public void setTomado(boolean tomado) {
        this.tomado = tomado;
    }
}