// GraphQL API endpoint
const GRAPHQL_ENDPOINT = "https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql";

export async function fetchUserInfo(jwt) {
  const query = `
    query {
        user {
            id
            login
            firstName
            lastName
            email
        }
    }
    `;
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error("Unauthorized or network error");
    }

    const result = await response.json();
    if (result.data && result.data.user && result.data.user.length > 0) {
      const user = result.data.user[0];
      return { success: true, user };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchXPTransactions(jwt, userId) {
  const query = `
        query($userId: Int!) {
            transaction(
                where: {
                    userId: {_eq: $userId}
                    type: {_eq: "xp"}
                    eventId: {_eq: 75}
                }
            ) {
                amount
                createdAt
            }
        }
    `;
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });
    if (!response.ok) {
      throw new Error("Unauthorized or network error");
    }
    const result = await response.json();
    if (result.data && result.data.transaction) {
      return { success: true, transactions: result.data.transaction };
    } else {
      return { success: false, error: "No XP transactions found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchAuditTransactions(jwt, userId) {
  const query = `
        query($userId: Int!) {
            transaction(
                where: {
                    userId: {_eq: $userId}
                    type: {_in: ["up", "down"]}
                }
            ) {
                type
                amount
            }
        }
    `;
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });
    if (!response.ok) {
      throw new Error("Unauthorized or network error");
    }
    const result = await response.json();
    if (result.data && result.data.transaction) {
      return { success: true, transactions: result.data.transaction };
    } else {
      return { success: false, error: "No audit transactions found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchUserGrades(jwt, userId) {
  const query = `
        query($userId: Int!) {
            progress(
                where: {
                    userId: {_eq: $userId}
                }
            ) {
                id
                grade
                createdAt
                path
                object {
                    id
                    name
                    type
                }
            }
        }
    `;
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });
    if (!response.ok) {
      throw new Error("Unauthorized or network error");
    }
    const result = await response.json();
    if (result.data && result.data.progress) {
      // Filter for module grades only
      const moduleGrades = result.data.progress.filter(p => 
        p.path && 
        p.path.includes("/module/")
      );
      console.log("Module grades found:", moduleGrades.length); // Debug log
      return { success: true, grades: moduleGrades };
    } else {
      return { success: false, error: "No grades found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchProjectProgress(jwt, userId) {
  const query = `
        query($userId: Int!) {
            progress(
                where: {
                    userId: {_eq: $userId}
                }
            ) {
                id
                grade
                path
                objectId
                object {
                    id
                    name
                    type
                }
            }
        }
    `;
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });
    if (!response.ok) {
      throw new Error("Unauthorized or network error");
    }
    const result = await response.json();
    console.log("Project progress result:", result); // Debug log
    
    if (result.data && result.data.progress) {
      // Filter for projects on the client side - only module projects
      const projects = result.data.progress.filter(p => 
        p.object && 
        p.object.type === "project" && 
        p.path && 
        p.path.includes("/module/")
      );
      console.log("Filtered module projects:", projects); // Debug log
      return { success: true, projects };
    } else {
      return { success: false, error: "No project progress found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchProjectResults(jwt, userId) {
  const query = `
        query($userId: Int!) {
            result(
                where: {
                    userId: {_eq: $userId}
                }
            ) {
                id
                grade
                type
                path
                objectId
                object {
                    id
                    name
                    type
                }
            }
        }
    `;
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });
    if (!response.ok) {
      throw new Error("Unauthorized or network error");
    }
    const result = await response.json();
    console.log("Project results result:", result); // Debug log
    
    if (result.data && result.data.result) {
      // Filter for projects on the client side - only module projects
      const projects = result.data.result.filter(r => 
        r.object && 
        r.object.type === "project" && 
        r.path && 
        r.path.includes("/module/")
      );
      console.log("Filtered module project results:", projects); // Debug log
      return { success: true, projects };
    } else {
      return { success: false, error: "No project results found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchUserSkills(jwt, userId) {
  const query = `
    query($userId: Int!) {
      progress(
        where: {userId: {_eq: $userId}, grade: {_gt: 0}},
        order_by: {grade: desc},
        limit: 3
      ) {
        grade
        object {
          name
          type
        }
      }
    }
  `;
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });
    if (!response.ok) {
      throw new Error("Unauthorized or network error");
    }
    const result = await response.json();
    // console.log('fetchUserSkills result:', result); // DEBUG
    if (result.data && result.data.progress) {
      // Map to flat array: { name, type, grade }
      const skills = result.data.progress.map(s => ({
        name: s.object?.name || "",
        type: s.object?.type || "",
        grade: s.grade
      }));
      return { success: true, skills };
    } else {
      return { success: false, error: "No skills found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
