import mongoose , {Document , Schema} from "mongoose"

export interface Candidate extends Document{
    id : string,
    email : string,
    password : string
    firstName : string
    lastName : string
    bio : string
    avatar : string
    isVerified : boolean,
    otp : number,
    role : string
}
const candidateSchema : Schema<Candidate>  = new Schema({
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
    bio: { 
        type: String, 
        default: '' 
    },
    avatar: { 
        type: String, 
        default: '' 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    role : {
        type : String,
        required : true
    }
});

const candidate = (mongoose.models.candidates as mongoose.Model<Candidate>) || mongoose.model<Candidate>('candidates', candidateSchema);

export default candidate; 