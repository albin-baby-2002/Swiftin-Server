 export interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}



 export type AuthRequest = CustomRequest & {
  headers: { authorization: string};
};