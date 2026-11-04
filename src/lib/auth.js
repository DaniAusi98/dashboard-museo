class AuthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7204';

    this.tokenKey = 'auth_token';
    this.userKey = 'auth_user';
  }

  // LOGIN PERSONAL DEL MUSEO
  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/api/v1/Usuario/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let message = 'Error al iniciar sesión';

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

  // REGISTER PERSONAL INTERNO
  async register(data) {
    const payload = {
      Nombre: data.nombre,
      Apellido: data.apellido,
      DNI: data.dni,
      Email: data.email,
      Telefono: data.telefono,
      FechaNacimiento: data.fechaNacimiento,
      RolUsuarioId: data.rolUsuarioId,
      Password: data.password,
    };

    const response = await fetch(
      `${this.baseUrl}/api/v1/PersonalMuseo/RegistrarPersonal`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let message = 'Error al registrar el personal';

      try {
        const errorJson = await response.json();
        message = errorJson.message || message;
      } catch {}

      throw new Error(message);
    }

    return await response.json();
  }

  // RECUPERAR SESIÓN
  async getCurrentUser() {
    const token = this.getToken();

    if (!token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/Usuario/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) this.logout();
        return null;
      }

      const result = await response.json();
      const user = result.data?.user ?? result.data;

      if (!user) return null;

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
    const token = localStorage.getItem(this.tokenKey);

    if (!token) return null;

    if (!this.isAuthenticated()) {
      this.logout();
      return null;
    }

    return token;
  }

  getUser() {
    if (!this.isAuthenticated()) {
      this.logout();
      return null;
    }

    const userStr = localStorage.getItem(this.userKey);

    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      this.logout();
      return null;
    }
  }

  getRole() {
    return this.getUser()?.roles ?? [];
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
      let base64 = token.split('.')[1];
      if (!base64) return false;

      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      while (base64.length % 4 !== 0) {
        base64 += '=';
      }

      const payload = JSON.parse(atob(base64));

      return !!payload.exp && payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem(this.tokenKey);

    if (!token) return false;

    try {
      const base64 = token.split('.')[1];

      if (!base64) return false;

      const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');

      const payload = JSON.parse(atob(normalized));

      return !!payload.exp && payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();

    const headers = {
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();

      if (window.location.pathname !== '/signIn') {
        window.location.href = '/signIn';
      }
    }

    return response;
  }
}

export const authService = new AuthService();
