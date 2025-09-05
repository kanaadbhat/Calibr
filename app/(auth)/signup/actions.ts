"use server";

import {connectToDatabase} from '@/utils/connectDb';
import candidate from '@/models/candidate.model';
import employer from '@/models/employer.model';
import bcrypt from 'bcryptjs';

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'employer' | 'candidate';
}

export async function createUser(userData: SignupData) {
  try {
    await connectToDatabase();

    const { email , password , firstName , lastName , role} = userData;
    if(!email || !password || !firstName || !lastName || !role){
        throw new Error("All the Fields are Required");
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    if(role == 'candidate'){
        const existingCandidate = await candidate.findOne({ email });
        if(existingCandidate){
            throw new Error("Email is already regsitered");
        }
        const user = await candidate.create({
            firstName , lastName , email , password : hashedPassword , role
        })
        await user.save();

        return {
            message : "Account Created Successfully",
            success : true
        }
    }
    else if(role == 'employer'){
        const existingEmployer = await employer.findOne({ email });
        if(existingEmployer){
            throw new Error("Email is already regsitered");
        }
        const user = await employer.create({
            firstName , lastName , email , password : hashedPassword , role
        })
        await user.save();
  
        return {
            message : "Account Created Successfully",
            success : true
        }
    }

  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

