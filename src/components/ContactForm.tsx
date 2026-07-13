import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [tgaccount, setTgaccount] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState<{ name?: string; email?: string; message?: string; tgaccount?: string;}>({});
    const [success, setSuccess] = useState("");
    const [serverError, setServerError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError({});
        setSuccess("");
        setServerError("");
        let localErrors: any = {};
        if (name === "") { localErrors.name = "Name is required"; }
        if (tgaccount === "") { localErrors.tgaccount = "Telegram is required"; }
        if (!email.includes('@')) { localErrors.email = "There is no @!"; }
        if (message.length < 10) { localErrors.message = "Text too short!"; }
        if (Object.keys(localErrors).length > 0) { setError(localErrors); }
        if (Object.keys(localErrors).length === 0) {
            try {
            const response = await fetch('/api/contact',{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ name, tgaccount, email, message })
            });
            if (response.ok){
            setSuccess("Success!");
            setName(""); setEmail(""); setMessage("");setTgaccount("");
            } else {
                const errorData: any = await response.json().catch(() => ({})); 
                setServerError(errorData.error || "Internal Server Error.");
        } 
        } catch (err) {
            setServerError("Can't connect to server")
        }
    }
    }
    return (
            <Card className="max-w-md mx-auto w-full my-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
                    
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Name:</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        {error.name && <p className="text-red-500 text-sm">{error.name}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="tgaccount">Telegram:</Label>
                        <Input id="tgaccount" value={tgaccount} onChange={(e) => setTgaccount(e.target.value)} />
                        {error.tgaccount && <p className="text-red-500 text-sm">{error.tgaccount}</p>}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email:</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="message">Message:</Label>
                        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
                        {error.message && <p className="text-red-500 text-sm">{error.message}</p>}
                    </div>
                    
                    <Button type="submit" variant="outline" className="mt-2">Submit</Button>

                    {success && <p className="text-green-500 text-center">{success}</p>}
                    {serverError && <p className="text-red-500 text-center">{serverError}</p>}
                </form>
            </Card>
        );
}