import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginPage() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setError("")
    try{
        const response = await fetch("/api/login", {
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: name, password: password })
        });
            if (response.ok) {
                console.log("Success!");
                navigate("/submissions");
            } else {
                const data = await response.json();
                setError(data.error);
            }
        
    } catch (err) {
        setError("Network error")
    } finally{
        setIsLoading(false)
    }
    };

    return(
        <div>
            <Card>
                <form onSubmit={handleLogin}>
                <Label>Username</Label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>Log In</Button>
                </form>
                {error && <p className="text-red-500">{error}</p>}
            </Card>
            <Link to="/">Home</Link>
        </div>
    )
}