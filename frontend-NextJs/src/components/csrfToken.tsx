// Function that fetchess csrf token from api.

export async function fetchCsrfToken(): Promise<string> {
    const response = await fetch("https://miyukiin.pythonanywhere.com/api/csrf-token/", {
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
  
    const data = await response.json();
    return data.csrfToken;
}
  