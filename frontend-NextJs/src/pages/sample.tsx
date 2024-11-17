// frontend/src/pages/sample.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

interface SampleData {
    message: string;
}

export default function SamplePage() {
    const [data, setData] = useState<SampleData | null>(null); // Specify the type of state

    useEffect(() => {
        axios.get<SampleData>('http://127.0.0.1:8000/api/sample/') // Specify the type of API response
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h1>Sample Page</h1>
            <p>Data from API: {data ? data.message : 'Loading...'}</p>
        </div>
    );
}
