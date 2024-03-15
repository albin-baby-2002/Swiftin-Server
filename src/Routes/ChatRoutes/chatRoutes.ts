import express from "express";
import { GetExistingConversationOrCreateNew, SearchUsersForChat, getAllConversationsData } from "../../Controllers/ChatControllers/chatControllers";

 export const  chatRouter = express.Router();

 chatRouter.post("/",GetExistingConversationOrCreateNew );
 chatRouter.get("/users", SearchUsersForChat);
chatRouter.get("/data",getAllConversationsData );


