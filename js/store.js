// js/store.js
import { supabase } from './supabaseClient.js';

class Store {
  async getUser(email) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) return null;
    return data;
  }

  async addUser(email, name, password) {
    const role = email === 'veerepallibalaramkrishna@gmail.com' ? 'admin' : 'user';
    const { data, error } = await supabase.from('users').insert([{ email, name, password, role }]).select().single();
    if (error) return null;
    return data;
  }

  async updateUserRole(userId, newRole) {
    await supabase.from('users').update({ role: newRole }).eq('id', userId);
  }

  async getAllUsers() {
    const { data } = await supabase.from('users').select('*');
    return data || [];
  }

  async addPost(post) {
    const { data, error } = await supabase.from('posts').insert([{
      authorName: post.authorName,
      content: post.content,
      videoUrl: post.videoUrl || null,
      image: post.image || null,
      likes: [],
      dislikes: [],
      comments: []
    }]).select().single();
    return data;
  }

  async getPosts() {
    const { data, error } = await supabase.from('posts').select('*').order('timestamp', { ascending: false });
    return data || [];
  }

  async toggleLike(postId, userId) {
    const { data: post } = await supabase.from('posts').select('likes, dislikes').eq('id', postId).single();
    if (!post) return;
    let likes = post.likes || [];
    let dislikes = post.dislikes || [];
    
    dislikes = dislikes.filter(id => id !== userId);
    
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }
    
    await supabase.from('posts').update({ likes, dislikes }).eq('id', postId);
  }

  async toggleDislike(postId, userId) {
    const { data: post } = await supabase.from('posts').select('likes, dislikes').eq('id', postId).single();
    if (!post) return;
    let likes = post.likes || [];
    let dislikes = post.dislikes || [];
    
    likes = likes.filter(id => id !== userId);
    
    if (dislikes.includes(userId)) {
      dislikes = dislikes.filter(id => id !== userId);
    } else {
      dislikes.push(userId);
    }
    
    await supabase.from('posts').update({ likes, dislikes }).eq('id', postId);
  }

  async addComment(postId, authorName, text) {
    const { data: post } = await supabase.from('posts').select('comments').eq('id', postId).single();
    if (!post) return;
    const comments = post.comments || [];
    comments.push({
      id: Date.now().toString(),
      authorName,
      text,
      timestamp: new Date().toISOString()
    });
    await supabase.from('posts').update({ comments }).eq('id', postId);
  }

  async addEvent(event) {
    await supabase.from('events').insert([event]);
  }

  async getEvents() {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    return data || [];
  }

  async addShop(shop) {
    await supabase.from('shops').insert([shop]);
  }

  async getShops() {
    const { data } = await supabase.from('shops').select('*');
    return data || [];
  }

  async addClubUpdate(update) {
    await supabase.from('clubs').insert([update]);
  }

  async getClubUpdates() {
    const { data } = await supabase.from('clubs').select('*').order('timestamp', { ascending: false });
    return data || [];
  }
}

export const store = new Store();
