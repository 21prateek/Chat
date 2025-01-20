import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { WebSocket, WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
import { prismaClient } from "@repo/db/database";
import { addUser, joinRoom, leaveRoom, store } from "./ws";

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", function connection(socket, req) {
  const url = req.url;

  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);

  const token = queryParams.get("token") ?? "";

  const userId = checkUser(token);

  if (userId == null) {
    socket.close();
    return;
  }

  // Add user to Redux store
  //so it will send this to our add user PayloadAction whose interface is UserState
  store.dispatch(
    addUser({
      userId,
      rooms: [],
      ws: socket,
    })
  );

  socket.on("message", async (data) => {
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type === "join_room") {
      store.dispatch(joinRoom({ userId: userId, roomId: parsedData.roomId }));
    }

    if (parsedData.type === "leave_room") {
      store.dispatch(leaveRoom({ userId, roomId: parsedData.roomId }));
    }

    if (parsedData.type === "chat") {
    }
  });
});
