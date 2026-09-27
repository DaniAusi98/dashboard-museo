// src/lib/auth.js

class AuthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "https://localhost:7204";

    this.tokenKey = "auth_token";
    this.userKey = "auth_user";
  }

  // LOGIN
  async login(email, password) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/UsuarioVisitante/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!response.ok) {
      let message = "Error al iniciar sesión";

      try {
        const errorJson = await response.json();
        message = errorJson.message || message;
      } catch {}

      throw new Error(message);
    }

    const result = await response.json();
    const data = result.data;

    this.setToken(data.token);
    this.setUser(data.user);

    return data;
  }

  // REGISTER
  async register(data) {
    const payload = {
      Nombre: data.firstName,
      Apellido: data.lastName,
      FechaNac: data.birthDate?.format("YYYY-MM-DD"),
      Email: data.email,
      Telefono: data.phone,
      Password: data.password,
    };

    const response = await fetch(
      `${this.baseUrl}/api/v1/UsuarioVisitante/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Error al registrarse");
    }

    return await response.json();
  }

  // CURRENT USER
  async getCurrentUser() {
    const token = this.getToken();

    if (!token) return null;

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/UsuarioVisitante/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) return null;

      const result = await response.json();

      const user = result.data?.user ?? result.data;

      this.setUser(user);

      return user;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getUser() {
    const userStr = localStorage.getItem(this.userKey);

    return userStr ? JSON.parse(userStr) : null;
  }

  getRole() {
    const user = this.getUser();

    return user?.role;
  }
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated() {
    const token = this.getToken();

    if (!token) return false;

    try {
      let base64 = token.split(".")[1];

      if (!base64) return false;

      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");

      while (base64.length % 4 !== 0) {
        base64 += "=";
      }

      const payload = JSON.parse(atob(base64));

      if (!payload.exp) return false;

      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      window.location.href = "/login";
    }

    return response;
  }
}

export const authService = new AuthService();
