import { io, Socket } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const socket: Socket = io(API_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket'],
});
