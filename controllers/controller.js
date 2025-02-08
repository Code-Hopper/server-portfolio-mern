import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// models
import AdminModel from "../models/AdminSchema.js"

dotenv.config({ path: './config.env' }); // Load environment variables

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Store OTP in memory with expiration (for production, use Redis)
let otpStore = {};

const sendOTP = async (adminEmail) => {
    try {
        const email = adminEmail
        console.log("Sending OPT to:", email);

        if (!email) return { message: "unable to send opt | din't have email  !", status: false }


        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

        await transporter.sendMail({
            from: `"Code-Hopper" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Code-hopper Login OTP",
            html: `<p>your opt is <span style="color:red;"> ${otp} </span> , it is valid for 5 mins!</p>`
        });

        // now when opt is genrated return to login function 

        return { message: "opt sent successfully !", status: true }

    } catch (error) {
        console.error("Error sending OPT:", error);
        return { message: "unable to send opt ", status: false }
    }
};

// ✅ Verify OTP Endpoint
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        console.log(email, "send otp", otp)

        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

        // Check if OTP exists for the given email
        const storedOTP = otpStore[email];

        console.log("stored Otp ", storedOTP)

        console.log("matching opt...")

        if (!storedOTP) return res.status(400).json({ message: "OTP expired or not requested" });

        // Check if OTP matches and is not expired
        if (storedOTP.otp !== otp || storedOTP.expiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        console.log("otp matched !")

        // ✅ OTP verified, proceed with login
        delete otpStore[email];  // Remove OTP after successful verification

        // ✅ Generate JWT Token (optional)
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        let result = await AdminModel.updateOne({ email: email, $set: { token: token } })

        console.log(result)

        res.status(200).json({ message: "OTP verified successfully and genrated token", token });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
};

let AdminLogin = async (req, res) => {
    try {

        let { email, password } = req.body

        if (!email || !password) throw ("invalid request missing email/password")

        let admin = await AdminModel.findOne({ email: email })

        if (!admin) throw ("email does not exists !")

        console.log(admin)

        // get user details

        // check hased password

        let verifyPassword = await bcrypt.compare(password, admin.password)

        // console.log(verifyPassword)

        if (!verifyPassword) throw ("wrong email/password !")

        // if password is valid

        console.log("password is valid !")

        // now redirect to sendOPT then verify opt then save new token for validation

        let result = await sendOTP(admin.email)

        // status will be true if opt has been sent | now told user, that we have sent a opt to your email address 

        if (!result.status) throw (result.message)

        console.log(result.message)

        res.status(202).json({ message: "email & password is valid. we have sent you a 6 digit opt | Please verify the opt !" })

        // then user will fill new form to validate the opt then token and dashboard access will be granted 

    } catch (err) {
        console.log("err while admin login : ", err)
        res.status(400).json({ message: "Problem while admin login", err })
    }
}

export { verifyOTP, AdminLogin };