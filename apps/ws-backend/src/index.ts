import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { WebSocket, WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
import { prismaClient } from "@repo/db/database";
import { addUser, joinRoom, leaveRoom, removeUser, store } from "./ws";
import { enqueueChat } from "./queue";

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
      //it will pass the data to our enqueueChat which is in queue.ts and it will add our data to chat schema in form of queue
      enqueueChat({
        roomId: parsedData.roomId,
        message: parsedData.message,
        userId: userId,
      });

      // Broadcast the message to the room
      const state = store.getState(); //It retrieves the current state of the Redux store. In Redux, the store is the central repository where the state of your entire application is stored. Using store.getState(), you can access the current state at any point in your application.It will return the current state of that redux store

      //filters users who are in the chat room (parsedData.roomId).
      state.users
        .filter((u) => u.rooms.includes(parsedData.roomId))
        .forEach((u) => {
          u.ws.send(
            JSON.stringify({
              type: "chat",
              message: parsedData.message,
              roomId: parsedData.roomId,
            })
          );
        });
    }
    socket.on("close", () => {
      store.dispatch(removeUser({ userId: userId }));
    });
  });
});
