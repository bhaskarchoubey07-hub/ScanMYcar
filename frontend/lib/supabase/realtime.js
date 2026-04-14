"use client";

import { createClient } from "./browser";

const supabase = createClient();

/**
 * Subscribes to real-time messages for a specific room (e.g., a vehicle SOS ID)
 * This uses Supabase Broadcast which is ephemeral.
 * 
 * @param {string} roomId - The unique identifier for the room
 * @param {Function} onMessage - Callback triggered when a message is received
 * @returns {import('@supabase/supabase-js').RealtimeChannel} - The subscription channel
 */
export function subscribeRoomMessages(roomId, onMessage) {
  const ch = supabase
    .channel(`room:${roomId}:messages`, { config: { private: true } })
    .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
      onMessage?.('INSERT', payload);
    })
    .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
      onMessage?.('UPDATE', payload);
    })
    .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
      onMessage?.('DELETE', payload);
    });

  ch.subscribe();
  return ch;
}

/**
 * Subscribes to presence updates for a specific room.
 * This tracks who is currently "online" or viewing the room.
 * 
 * @param {string} roomId - The unique identifier for the room
 * @param {string} userId - The ID of the current user
 * @param {Function} onPresenceUpdate - Callback triggered on sync, join, or leave
 * @returns {import('@supabase/supabase-js').RealtimeChannel} - The presence channel
 */
export function subscribeRoomPresence(roomId, userId, onPresenceUpdate) {
  const presenceCh = supabase
    .channel(`room:${roomId}:presence`, {
      config: {
        private: true,
        presence: { key: userId }, // stable key per user
      },
    });

  presenceCh
    .on('presence', { event: 'sync' }, () => {
      const state = presenceCh.presenceState();
      onPresenceUpdate?.('sync', state);
    })
    .on('presence', { event: 'join' }, ({ key, currentPresences }) => {
      onPresenceUpdate?.('join', key, currentPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      onPresenceUpdate?.('leave', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;
      await presenceCh.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      });
    });

  return presenceCh;
}

/**
 * Unsubscribes from a channel and removes it from the Supabase client.
 * 
 * @param {import('@supabase/supabase-js').RealtimeChannel} channel - The channel to remove
 */
export function unsubscribeChannel(channel) {
  if (channel && supabase) {
    supabase.removeChannel(channel);
  }
}
