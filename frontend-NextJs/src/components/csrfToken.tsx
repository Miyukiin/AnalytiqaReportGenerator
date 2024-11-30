// Function that fetchess csrf token from api.

export async function fetchCsrfToken(): Promise<string> {
    const response = await fetch("http://127.0.0.1:8000/api/csrf-token/", {
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
  
    const data = await response.json();
    return data.csrfToken;
}
  