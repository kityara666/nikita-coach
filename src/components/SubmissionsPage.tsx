import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        async function fetchData() {
                    try {
                        const response = await fetch('/api/submissions');
                        
                        if (!response.ok) {
                            throw new Error("Error");
                        }
                        
                        const data = await response.json();
                        
                        setSubmissions(data);
                        
                    } catch (err: any) {
                        setError(err.message || "Cant upload data");
                    } finally {
                        setIsLoading(false);
                    }
                    
                }
                fetchData();
    }, []);

    return (
        <div>
            <Link to="/">Home</Link>
            <h1 className="text-3xl font-bold mb-6">List</h1>
            {submissions.map((submission, index) => (
            <Card key={index} className="mb-4 p-4">
                <p><strong>Name:</strong> {submission.name}</p>
                <p><strong>Telegram:</strong> {submission.tgaccount}</p>
                <p><strong>Email:</strong> {submission.email}</p>
                <p><strong>Message:</strong> {submission.message}</p>
                <p className="text-sm text-zinc-500 mt-4">
                    {new Date(submission.createdAt).toLocaleString()}
                </p>
            </Card>
            ))}
        </div>
    );
}

