import mongoose , {Document , Schema} from "mongoose"

export interface Employer extends Document{
    email : string,
    password : string
    firstName : string
    lastName : string
    avatar : string
    isVerified : boolean,
    otp : number
}
const employerSchema : Schema<Employer>  = new Schema({
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select : false
    },
    firstName: { 
        type: String, 
        required: [true, 'First name is required'] 
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'] 
    },
    avatar: { 
        type: String, 
        default: '' 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
});

const employer = (mongoose.models.employer as mongoose.Model<Employer>) || mongoose.model<Employer>('employer', employerSchema);

export default employer; 