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
const candidateSchema : Schema<Employer>  = new Schema({
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'] 
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
    },
    otp: { 
        type: Number,
        required: true 
    }
});

const User = (mongoose.models.User as mongoose.Model<Employer>) || mongoose.model<Employer>('User', candidateSchema);

export default User; 