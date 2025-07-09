export async function login(username, password) {
  console.log("login() called with:", username, password);
  const endpoint = "https://learn.zone01kisumu.ke/api/auth/signin";
  const credentials = btoa(`${username}:${password}`);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return {
        success: false,
        error: "Invalid credentials. Please try again.",
      };
    }
    const data = await response.json();
    console.log("Signin response:", data);
    if (data && typeof data === "string") {
      localStorage.setItem("jwt", data);
      return { success: true };
    } else if (data && data.token) {
      localStorage.setItem("jwt", data.token);
      return { success: true };
    } else if (data && data.jwt) {
      localStorage.setItem("jwt", data.jwt);
      return { success: true };
    } else {
      return { success: false, error: "No token received from server" };
    }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
}

export function logout() {
  localStorage.removeItem("jwt");
}
