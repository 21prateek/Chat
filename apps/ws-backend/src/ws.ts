//1.Import Statements
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WebSocket } from "ws";

//2. Define Interfaces
interface UserState {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

interface WebSocketState {
  users: UserState[];
}

//3. Initial State
const initialState: WebSocketState = {
  users: [],
};
/*It will store value like this
 initialState= {
  users: [
    {
      userId: "user1",
      rooms: ["room1", "room2"],
      ws: WebSocketInstance1, // Actual WebSocket object
    },
    {
      userId: "user2",
      rooms: ["room2"],
      ws: WebSocketInstance2, // Another WebSocket object
    }
  ]
}
*/

//4. Create Slice
//createSlice:A function that accepts an initial state, an object full of reducer functions, and a "slice name", and automatically generates action creators and action types that correspond to the reducers and state.
const wsSlice = createSlice({
  name: "websocket",
  initialState, //on which varaible or state we will start, means here initial state value is users[] which is an array of different object which contain name,roomId and ws server

  //A mapping from action types to action-type-specific case reducer functions. For every action type, a matching action creator will be generated using createAction().
  reducers: {
    //action PayloadAction has type UserState interface
    addUser(state, action: PayloadAction<UserState>) {
      //so action.payload wil be of UserState interface value and we will be adding it to the users array
      //it will be an empty payload means userId and socket will have value but room will contain empty array
      state.users.push(action.payload);
    },
    removeUser(state, action: PayloadAction<{ userId: string }>) {
      //here we will remove that user from that
      //will filter out user.userId and action.payload will contain a string which will be userId and if its not equal then we will add that user and if equal dont add that user
      state.users = state.users.filter(
        (user) => user.userId !== action.payload.userId
      );
    },
    joinRoom(state, action: PayloadAction<{ userId: string; roomId: string }>) {
      //action payload will contain object of userId and roomId
      //here we will find that user and then if the userId and payload using id matches then we will put it in user varaible
      const user = state.users.find(
        (user) => user.userId === action.payload.userId
      );
      //then we will just push the room if the roomId is already there then dont push
      if (user && !user.rooms.includes(action.payload.roomId)) {
        user.rooms.push(action.payload.roomId);
      }
    },
    leaveRoom(
      state,
      action: PayloadAction<{ userId: string; roomId: string }>
    ) {
      //to leave room find that user first and then  filter in the user.rooms array
      const user = state.users.find(
        (user) => user.userId === action.payload.userId
      );
      if (user) {
        user.rooms = user.rooms.filter(
          (room) => room !== action.payload.roomId
        );
      }
    },
  },
});

//5. Export Actions
//Action creators for the types of actions that are handled by the slice reducer.
export const { addUser, removeUser, joinRoom, leaveRoom } = wsSlice.actions;

//6. Configure Store
export const store = configureStore({
  reducer: wsSlice.reducer,
});

//7. Export Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
