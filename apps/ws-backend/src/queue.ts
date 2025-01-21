//install
//pnpm add bull

import Bull from "bull";
import { prismaClient } from "@repo/db/database";

const chatQueue = new Bull("chatQueue"); //This is the Queue constructor. It creates a new Queue that is persisted in Redis. Everytime the same queue is instantiated it tries to process all the old jobs that may exist from a previous unfinished session.

chatQueue.process(async (job) => {
  const { roomId, message, userId } = job.data;

  await prismaClient.chat.create({
    data: {
      roomId: roomId,
      message,
      userId,
    },
  });
});

//so we are calling this enqueuChat in the index.ts so chatData will contain all the data which will be send by that index.ts websocket and then chatQueue which is the Bull it will add that chatData into the chat schema or data base
export const enqueueChat = (chatData: {
  roomId: string;
  message: string;
  userId: string;
}) => {
  chatQueue.add(chatData);
};
