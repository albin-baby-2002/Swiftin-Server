import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../Models/userModel";
import { sendOtpEmail } from "../Helpers/userVerificationHelper";
import { ZodError, z } from "zod";

const userSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(5, "user name should have min 5 character"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "minimum 8 char & min one (uppercase & lowercase letter, special char & number)",
      }
    )
}); 

export const newUserRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userData = req.body;
  
   const validationResult = userSchema.safeParse(userData);
    
   if (!validationResult.success) {
    const validationError: ZodError = validationResult.error;
    
    res.status(400).json({message:validationError.errors[0].message})
    
   }
   
   if(validationResult.success){
    
       const {email,username,password} = validationResult.data;
        try {
          const duplicate = await User.findOne({ email });

          if (duplicate) return res.sendStatus(409); // Conflict

          const hashedPwd = await bcrypt.hash(password, 10);

          const newUser = new User({
            username,
            password: hashedPwd,
            email,
          });

          newUser.save();

          await sendOtpEmail(newUser);

          res.status(201).json({ userId: newUser._id, email: newUser.email });
          
        } catch (err: any) {
          console.log(err);

          next(err);
        }
   }
   
   

 
};
