import { allowedOrigins } from "./allowedOrigins";

const corsOptions = {
  // need to remove the origin == undefined while using in production

  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allowed: boolean) => void
  ) => {
    console.log(origin,'origin')
    console.log(allowedOrigins,'allowed-origin')
    if (
      (origin && allowedOrigins.indexOf(origin) !== -1) ||
      origin == undefined
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by Cors"+origin), false);
    }
  },

  credentials: true, // Allow credentials (e.g., cookies)
  optionsSuccessStatus: 204, // Respond 204 No for successful preflight req
};

export default corsOptions;
