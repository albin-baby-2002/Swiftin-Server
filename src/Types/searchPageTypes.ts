export interface TUserInfo {
  id: string;
  username: string;
  roles: number[];
}

export interface TDecodedToken {
  UserInfo: TUserInfo;
}
export interface TSearchQuery {
  search: string;
  page: number;
  rooms: number;
  guests: number;
  sortBy: "highToLow" | "lowToHigh";
}
