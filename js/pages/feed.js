// js/pages/feed.js
import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast } from '../app.js';
import { supabase } from '../supabaseClient.js';

export async function renderFeed() {
  const container = document.createElement('div');
  const user = auth.getCurrentUser();

  container.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto;">
      <h2 class="h2">Community Feed</h2>
      <p class="text-muted mb-4">See what's happening in your hometown.</p>

      <div class="card mb-4" style="border: 2px solid var(--primary-light);">
        <form id="post-form">
          <textarea id="post-content" rows="3" placeholder="What's on your mind, ${user.name}?" class="w-full" style="border: none; resize: none; margin-bottom: 1rem; font-size: 1rem;" required></textarea>
          
          <div id="video-preview-container" style="display: none; position: relative; margin-bottom: 1rem;">
            <video id="video-preview" controls style="width: 100%; border-radius: var(--radius-md); max-height: 300px; background: #000;"></video>
            <button type="button" id="remove-video-btn" class="btn btn-danger btn-sm" style="position: absolute; top: 0.5rem; right: 0.5rem; border-radius: var(--radius-full); padding: 0.25rem 0.5rem;"><i class="ph ph-x"></i></button>
          </div>

          <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
            <div class="flex gap-2">
              <label for="video-upload" class="btn btn-secondary btn-sm" style="cursor: pointer;">
                <i class="ph ph-video-camera"></i> Add Video
              </label>
              <input type="file" id="video-upload" accept="video/*" style="display: none;">
            </div>
            <button type="submit" class="btn btn-primary" id="submit-btn"><i class="ph ph-paper-plane-right"></i> Post</button>
          </div>
        </form>
      </div>

      <div id="posts-container" class="flex" style="flex-direction: column; gap: 1.5rem;"></div>
    </div>
  `;

  const postsContainer = container.querySelector('#posts-container');
  const videoInput = container.querySelector('#video-upload');
  const videoPreviewContainer = container.querySelector('#video-preview-container');
  const videoPreview = container.querySelector('#video-preview');
  const removeVideoBtn = container.querySelector('#remove-video-btn');
  const submitBtn = container.querySelector('#submit-btn');
  
  let currentVideoUrl = null;
  let currentVideoFile = null;

  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
      currentVideoFile = file;
      currentVideoUrl = URL.createObjectURL(file);
      videoPreview.src = currentVideoUrl;
      videoPreviewContainer.style.display = 'block';
      // Make textarea not required if video is present
      container.querySelector('#post-content').required = false;
    }
  });

  removeVideoBtn.addEventListener('click', () => {
    if (currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
    currentVideoUrl = null;
    currentVideoFile = null;
    videoPreview.src = '';
    videoInput.value = '';
    videoPreviewContainer.style.display = 'none';
    container.querySelector('#post-content').required = true;
  });

  const attachPostListeners = () => {
    container.querySelectorAll('.btn-like').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const postId = e.currentTarget.dataset.postid;
        await store.toggleLike(postId, user.id);
        await renderPostList();
      });
    });

    container.querySelectorAll('.btn-dislike').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const postId = e.currentTarget.dataset.postid;
        await store.toggleDislike(postId, user.id);
        await renderPostList();
      });
    });

    container.querySelectorAll('.btn-share').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      });
    });

    container.querySelectorAll('.btn-comment-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const postId = e.currentTarget.dataset.postid;
        const commentSection = container.querySelector(`#comments-${postId}`);
        commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
      });
    });

    container.querySelectorAll('.comment-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const postId = e.target.dataset.postid;
        const input = e.target.querySelector('input');
        if (input.value.trim()) {
          await store.addComment(postId, user.name, input.value.trim());
          await renderPostList();
          showToast('Comment added');
        }
      });
    });
  };

  const renderPostList = async () => {
    const currentPosts = await store.getPosts();
    
    if (currentPosts.length === 0) {
      postsContainer.innerHTML = '<div class="text-center text-muted mt-4">No posts yet. Be the first to post!</div>';
      return;
    }

    postsContainer.innerHTML = currentPosts.map(post => {
      const likes = post.likes || [];
      const dislikes = post.dislikes || [];
      const comments = post.comments || [];
      const hasLiked = likes.includes(user.id);
      const hasDisliked = dislikes.includes(user.id);

      return `
      <div class="card">
        <div class="post-header">
          <div class="avatar">${post.authorName.charAt(0)}</div>
          <div>
            <div class="post-author">${post.authorName}</div>
            <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
          </div>
        </div>
        
        <div class="post-content" style="font-size: 1.05rem;">${(post.content || '').replace(/\\n/g, '<br>')}</div>
        
        ${post.videoUrl ? `
          <div style="margin-bottom: 1rem;">
            <video src="${post.videoUrl}" controls style="width: 100%; border-radius: var(--radius-md); max-height: 400px; background: #000;"></video>
          </div>
        ` : ''}
        
        <div class="post-actions" style="display: flex; gap: 0.5rem; justify-content: space-between;">
          <div class="flex gap-2">
            <button class="post-action btn-like flex items-center gap-2" data-postid="${post.id}" style="color: ${hasLiked ? 'var(--primary-color)' : 'var(--text-muted)'}; padding: 0.5rem; border-radius: var(--radius-md);">
              <i class="ph ${hasLiked ? 'ph-thumbs-up-fill' : 'ph-thumbs-up'}"></i> ${likes.length || ''}
            </button>
            <button class="post-action btn-dislike flex items-center gap-2" data-postid="${post.id}" style="color: ${hasDisliked ? 'var(--danger)' : 'var(--text-muted)'}; padding: 0.5rem; border-radius: var(--radius-md);">
              <i class="ph ${hasDisliked ? 'ph-thumbs-down-fill' : 'ph-thumbs-down'}"></i> ${dislikes.length || ''}
            </button>
            <button class="post-action btn-comment-toggle flex items-center gap-2" data-postid="${post.id}" style="padding: 0.5rem; border-radius: var(--radius-md);">
              <i class="ph ph-chat-circle"></i> ${comments.length || ''}
            </button>
          </div>
          <button class="post-action btn-share flex items-center gap-2" style="padding: 0.5rem; border-radius: var(--radius-md);">
            <i class="ph ph-share-network"></i> Share
          </button>
        </div>

        <div id="comments-${post.id}" style="display: none; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <div class="comments-list flex flex-col gap-2 mb-3">
            ${comments.length === 0 ? '<div class="text-muted text-sm">No comments yet.</div>' : 
              comments.map(c => `
                <div style="background: var(--bg-color); padding: 0.5rem 0.75rem; border-radius: var(--radius-md);">
                  <div style="font-weight: 600; font-size: 0.875rem;">${c.authorName} <span class="text-muted" style="font-weight: 400; font-size: 0.75rem; margin-left: 0.5rem;">${new Date(c.timestamp).toLocaleString()}</span></div>
                  <div style="font-size: 0.875rem;">${c.text}</div>
                </div>
              `).join('')
            }
          </div>
          <form class="comment-form flex gap-2" data-postid="${post.id}">
            <input type="text" placeholder="Write a comment..." class="w-full" style="padding: 0.4rem 0.75rem; font-size: 0.875rem;">
            <button type="submit" class="btn btn-secondary btn-sm"><i class="ph ph-paper-plane-right"></i></button>
          </form>
        </div>
      </div>
    `}).join('');

    attachPostListeners();
  };

  await renderPostList();

  const form = container.querySelector('#post-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('post-content').value.trim();
    if (!content && !currentVideoFile) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Posting...';

    let publicVideoUrl = null;

    if (currentVideoFile) {
      const fileExt = currentVideoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('media').upload(fileName, currentVideoFile);
      
      if (error) {
        showToast('Error uploading video: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph ph-paper-plane-right"></i> Post';
        return;
      }
      
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
      publicVideoUrl = urlData.publicUrl;
    }

    await store.addPost({
      authorId: user.id,
      authorName: user.name,
      content: content,
      videoUrl: publicVideoUrl
    });

    document.getElementById('post-content').value = '';
    removeVideoBtn.click(); // resets video preview
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="ph ph-paper-plane-right"></i> Post';
    
    await renderPostList();
    showToast('Posted successfully!');
  });

  return container;
}
