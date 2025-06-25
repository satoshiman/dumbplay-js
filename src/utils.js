function ensureTrailingSlash() {
  if (!window.location.pathname.endsWith("/")) {
    window.location.replace(
      window.location.pathname + "/" + window.location.search
    );
  }
}
async function loadMarkdown() {
  try {
    const response = await fetch("README.md");
    if (!response.ok) throw new Error("Failed to fetch Markdown file");

    const markdown = await response.text();
    document.getElementById("content").innerHTML = marked.parse(markdown);
  } catch (error) {
    document.getElementById("content").innerHTML =
      "Error loading Markdown file!";
    console.error(error);
  }
}
shortAddress = (address, num = 5) => {
  if (!address) {
    return "";
  }
  return (
    address.substring(0, num) +
    "…" +
    address.substring(address.length - num - 1, address.length)
  );
};

function normalizeStarknetAddress(address) {
  if (!address) {
    return "";
  }
  let hexPart = address.replace(/^0x/, "");

  hexPart = hexPart.padStart(64, "0");
  return "0x" + hexPart;
}

function decodeJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token");
  }
  const payload = parts[1];
  return JSON.parse(atob(payload));
}

function getAndValidateJWT() {
  const address = WalletManager.address;
  if (!address) {
    console.log("No address provided");
    return;
  }
  const token = localStorage.getItem(`jwt.${Constants.GAME_ID}`);
  if (!token) {
    console.log("No token found");
    return;
  }
  const decoded = decodeJWT(token);
  const isExpired = decoded.exp * 1000 - Date.now() <= 0;
  const isOldAddress =
    normalizeStarknetAddress(decoded.address) ===
    normalizeStarknetAddress(address);
  if (isExpired || !isOldAddress) {
    localStorage.removeItem(`jwt.${Constants.GAME_ID}`);
    console.log("Token is expired or address is old");
    return;
  }
  return { decoded, token };
}

async function getAPI(path, auth = false) {
  try {
    let headers = {};
    if (auth) {
      const jwt = getAndValidateJWT();
      if (!jwt) {
        throw new Error("No token found");
      }
      headers = { Authorization: `Bearer ${jwt?.token}` };
    }

    const response = await fetch(this.url(path), {
      headers: headers,
    });
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.errors[0].message);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function url(path) {
  return `${Constants.HOST}/${path}`;
}

async function postAPI(path, bodyData, auth = false) {
  try {
    let headers = {};
    if (auth) {
      const jwt = getAndValidateJWT();
      if (!jwt) {
        throw new Error("No token found");
      }
      headers = { Authorization: `Bearer ${jwt?.token}` };
    }
    const response = await fetch(this.url(path), {
      method: "POST",
      headers: headers,
      body: JSON.stringify(bodyData),
    });
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.errors[0].message);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
