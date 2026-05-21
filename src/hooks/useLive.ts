import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useLive(matchId: string | null, onEvent: (event: any) => void) {
  const savedCb = useRef(onEvent);
  savedCb.current = onEvent;

  useEffect(() => {
    if (!matchId) return;

    if (!socket) {
      socket = io();
    }

    socket.emit('join', matchId);
    const handler = (event: any) => {
      savedCb.current?.(event);
    };

    socket.on('match:event', handler);
    socket.on('ai:message', handler);

    return () => {
      if (socket) {
        socket.off('match:event', handler);
        try { socket.emit('leave', matchId); } catch (e) {}
      }
    };
  }, [matchId]);
}
