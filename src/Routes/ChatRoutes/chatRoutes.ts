import express from "express";
import { GetExistingConversationOrCreateNew, SearchUsersForChat, getAllConversationsData } from "../../Controllers/ChatControllers/chatControllers";

 export const  chatRouter = express.Router();

chatRouter.get("/search/users", SearchUsersForChat);
chatRouter.post("/conversation/",GetExistingConversationOrCreateNew );
chatRouter.get("/conversations/data",getAllConversationsData );


