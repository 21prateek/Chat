declare global {
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateRoomSchema, createUser, SigninSchema } from "@repo/common/types";

import { prismaClient } from "@repo/db/database";
import { authMiddleware } from "./middleware";

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const parsedData = createUser.safeParse(req.body);

    if (!parsedData.success) {
      res.json({
        message: "Incorrect credientials",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    const response = await prismaClient.user.create({
      data: {
        email: parsedData.data.name,
        name: parsedData.data.username,
        password: hashedPassword,
      },
    });

    res.json({
      message: "You have been signed in",
      userId: response.id,
    });
    return;
  } catch (e) {
    res.json({
      message: "Cannot singup try again or maybe later",
    });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const parsedData = SigninSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.json({
        message: "Wrong inputs",
      });
      return;
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: parsedData.data.username,
      },
    });

    // Check if user exists and the password is valid
    if (user) {
      const isPasswordValid = await bcrypt.compare(
        parsedData.data.password,
        user.password
      );

      if (isPasswordValid) {
        //generate the jwt, here userId will be the first and user.id will be the one with which our token gets converted
        const token = jwt.sign(
          {
            userId: user?.id,
          },
          JWT_SECRET
        );
        res.json({
          token,
          message: "Signin successful",
        });
      } else {
        res.json({
          message: "Invalid credentials",
        });
      }
    } else {
      res.json({
        message: "Invalid credentials",
      });
    }
  } catch (e) {
    res.json({
      message: "Something went wrong during sign in ",
      e,
    });
  }
});

app.post("/createRoom", authMiddleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.json({
      message: "Wrong inputs",
    });
    return;
  }

  const userId = req.userId;

  if (!userId) {
    res.json({
      message: "Something went wrong",
    });
    return;
  }
  try {
    const room = await prismaClient.room.create({
      data: {
        adminId: userId,
        slug: parsedData.data.name,
      },
    });
    res.json({
      message: "Create a room",
      roomId: room.id,
    });
  } catch (e) {
    res.json({
      message: "Something went wrong",
    });
  }
});

app.post("/room/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const roomChats = await prismaClient.chat.findMany({
      where: {
        roomId: Number(roomId),
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
    });
    res.json({
      roomChats,
    });
  } catch (e) {
    res.json({
      messages: [],
    });
  }
});

app.post("/chat/:slug", async (req, res) => {
  const slug = req.params.slug;

  const room = await prismaClient.room.findFirst({
    where: {
      slug: slug,
    },
  });

  res.json({
    room,
  });
});
