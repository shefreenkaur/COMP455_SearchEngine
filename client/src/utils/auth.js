import decode from 'jwt-decode';

class AuthService {
  getToken() {
    return localStorage.getItem('id_token');
  }

  loggedIn() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }

  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('id_token');
        return true;
      }
      return false;
    } catch (err) {
      return true;
    }
  }

  login(idToken) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }

  
}

// Fix the warning by assigning to a variable before export
const authService = new AuthService();
export default authService;
