import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error,setError] = useState<{ name?: string; email?: string; message?: string }>({});
    const [success,setSuccess] = useState("");


    function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setError({});
        setSuccess("");
        let localErrors: any = {};
        if (name === "") { localErrors.name = "Name is required";}
        if (!email.includes('@')) {localErrors.email = "There is no @!"}
        if (message.length < 10) {localErrors.message = "Text too short!"}
        if (Object.keys(localErrors).length > 0) {setError(localErrors);}
        if (Object.keys(localErrors).length === 0) {
            setSuccess("Success!")
            setName(""); setEmail(""); setMessage("");
        }
    }


    return (
    <form onSubmit={handleSubmit} className="mx-auto justify-center py-10 flex flex-col gap-4 max-w-md p-6 w-full">
        
        <label>Name: <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded p-2 w-full"/></label>
        {error.name && <p className="text-red-500">{error.name}</p>}
        
        <label>Email:<input value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded p-2 w-full"/></label>
        {error.email && <p className="text-red-500">{error.email}</p>}
        
        <label>Message:<textarea value={message} onChange={(e) => setMessage(e.target.value)} className="border rounded p-2 w-full"/></label>
        {error.message && <p className="text-red-500">{error.message}</p>}
        
        <Button type='submit' variant="outline">Submit</Button>

        {success && <p className="text-green-500">{success}</p>}
    </form>
    );
}
