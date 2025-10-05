import mongoose , {Document , Schema} from "mongoose"

export interface Employer extends Document{
    email : string,
    password : string
    firstName : string
    lastName : string
    companyName : string
    avatar : string
    logo : string
    isVerified : boolean,
    otp : number,
    role : string
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
    companyName: { 
        type: String, 
        default: '' 
    },
    avatar: { 
        type: String, 
        default: '' 
    },
    logo: { 
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

const employer = (mongoose.models.employers as mongoose.Model<Employer>) || mongoose.model<Employer>('employers', employerSchema);

export default employer; 