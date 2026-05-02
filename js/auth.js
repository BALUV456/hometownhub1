// js/auth.js
import { store } from './store.js';

class Auth {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('hh_current_user')) || null;
    this.listeners = [];
  }

  async login(email, password) {
    const user = await store.getUser(email);
    if (!user) {
      return { success: false, error: 'Email ID not exist. Please create an account.' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    
    this.currentUser = user;
    localStorage.setItem('hh_current_user', JSON.stringify(user));
    this.notify();
    return { success: true, user };
  }

  async register(name, email, password) {
    const existingUser = await store.getUser(email);
    if (existingUser) {
      return { success: false, error: 'Email ID already exists. Please login.' };
    }

    const user = await store.addUser(email, name, password);
    if (!user) {
      return { success: false, error: 'Failed to create account.' };
    }
    this.currentUser = user;
    localStorage.setItem('hh_current_user', JSON.stringify(user));
    this.notify();
    return { success: true, user };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('hh_current_user');
    this.notify();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === role;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const auth = new Auth();
