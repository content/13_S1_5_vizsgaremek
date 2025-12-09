"use client"

import React from "react"
import { UploadButton, UploadDropzone } from "@/components/uploadthing/uploadthing";

export default function RegisterPage() {
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [profilePicture, setProfilePicture] = React.useState<string | null>(null)


    const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        formData.append("password", password);
        
        if (profilePicture) {
            formData.append("profile_picture", profilePicture);
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                body: formData,
            });
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }

    return (
        <div>
            Register Page
            <form action="" onSubmit={(e) => registerUser(e)}>
                <input type="text" name="firstName" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)}/>
                <input type="text" name="lastName" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)}/>
                <input type="email" name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" name="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                <UploadButton 
                    endpoint={"imageUploader"}
                    onClientUploadComplete={(res) => {
                        const url = res[0].ufsUrl
                        setProfilePicture(url)
                        alert("Upload Completed");
                    }}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}