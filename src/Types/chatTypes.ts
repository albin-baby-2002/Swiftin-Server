export interface TUserData {
  _id: string;
  username: string;
  email: string;
  image: string;
}

export interface TMessage {
  sender: TSenderData;
  content: string;
  chat: TChatData;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TSenderData {
  _id: string;
  username: string;
  email: string;
  image: string;
}

export interface TChatData {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: TUserData[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  latestMessage: string;
}
