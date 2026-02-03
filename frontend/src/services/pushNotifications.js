/**
 * Push Notifications Service
 * Handles Web Push API for desktop/mobile notifications
 */

// Register service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    return subscription;
  } catch (error) {
    console.error('❌ Failed to subscribe to push:', error);
  }
}

// Show local notification
export async function showNotification(title, options = {}) {
  const registration = await navigator.serviceWorker.ready;
  return registration.showNotification(title, {
    icon: '/logo.png',
    badge: '/badge.png',
    tag: options.tag || 'notification',
    ...options
  });
}

// Send subscription to backend
export async function sendSubscriptionToBackend(subscription) {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(subscription)
    });
    return response.json();
  } catch (error) {
    console.error('❌ Failed to subscribe:', error);
  }
}

// Enable all notifications
export async function enablePushNotifications(vapidPublicKey) {
  try {
    // Register service worker
    await registerServiceWorker();

    // Request permission
    const permitted = await requestNotificationPermission();
    if (!permitted) {
      console.log('Notification permission denied');
      return false;
    }

    // Subscribe to push
    const subscription = await subscribeToPush(vapidPublicKey);
    if (subscription) {
      await sendSubscriptionToBackend(subscription);
      return true;
    }
  } catch (error) {
    console.error('Error enabling push notifications:', error);
  }
  return false;
}

// Disable notifications
export async function disablePushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      // Notify backend
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    }
  } catch (error) {
    console.error('Error disabling push notifications:', error);
  }
}

// Utility: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

// Notify about new game
export async function notifyNewGame(game) {
  await showNotification(`🎮 New Free Game: ${game.title}`, {
    body: `Available on ${game.source.toUpperCase()} - Worth $${game.price}`,
    icon: game.imageUrl,
    badge: '/badge.png',
    tag: `game-${game.id}`,
    requireInteraction: false,
    data: {
      url: `/games/${game.id}`,
      gameId: game.id
    }
  });
}

export default {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  showNotification,
  sendSubscriptionToBackend,
  enablePushNotifications,
  disablePushNotifications,
  notifyNewGame
};
