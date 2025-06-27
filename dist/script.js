function checking() {
  if (!Constants.GAME_ID) {
    console.log("No game id");
    return;
  }
}

checking();

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

// DOM elements

//? SHOW IF NOT CONNECTED
// Connect Wallet Button
let buttonConnectWallet = document.getElementById("buttonConnectWallet");
// Select Wallet Modal
const selectWalletModal = new bootstrap.Modal(
  document.getElementById("selectWalletModal")
);
// Connect Braavos Wallet Button
let connectBraavosWallet = document.getElementById("connectBraavosWallet");
// Connect ArgentX Wallet Button
let connectArgentXWallet = document.getElementById("connectArgentXWallet");
// Connect Keplr Wallet Button
let connectKeplrWallet = document.getElementById("connectKeplrWallet");

//? SHOW IF CONNECTED
// Wallet Dropdown Trigger
let walletDropdown = document.getElementById("walletDropdown");
// Disconnect Button
let disconnectButton = document.getElementById("disconnectButton");
// Wallet Address
let walletAddress = document.getElementById("walletAddress");
// Wallet Balance
let walletBalance = document.getElementById("walletBalance");

// Wallet Manager Object
window.WalletManager = {
  // Private state using closure
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    walletExtensions: null,
  },

  get isConnected() {
    return this.walletState.isConnected;
  },

  get address() {
    return this.walletState.address;
  },

  get chainId() {
    return this.walletState.chainId;
  },

  get walletExtensions() {
    return this.walletState.walletExtensions;
  },

  // Setters with validation
  setWalletState(newState) {
    if (typeof newState.isConnected === "boolean") {
      this.walletState.isConnected = newState.isConnected;
    }
    if (newState.address) {
      this.walletState.address = newState.address;
    }
    if (newState.chainId) {
      this.walletState.chainId = newState.chainId;
    }
    if (newState.walletExtensions) {
      this.walletState.walletExtensions = newState.walletExtensions;
    }

    // Trigger event when wallet state changes
    this.emitWalletStateChange();
  },

  // Connection methods
  async connect(walletExtension) {
    switch (walletExtension) {
      case "braavos":
        window.starknet_selected = window.starknet_braavos;
        break;
      case "argentx":
        window.starknet_selected = window.starknet_argentX;
        break;
      case "keplr":
        window.starknet_selected = window.starknet_keplr;
        break;
    }

    console.log("connect", walletExtension);
    if (!window.starknet_selected) {
      console.log("Starknet wallet was not installed!");
      return;
    }

    try {
      const accounts = await window.starknet_selected.enable();

      console.log("accounts", accounts);

      if (accounts.length > 0) {
        WalletManager.setWalletState({
          address: normalizeStarknetAddress(accounts[0]),
          isConnected: true,
        });

        window.localStorage.setItem("isConnected", "true");
      }

      ApiUtils.updateUserInfo();

      ApiUtils.auth();
      // try {
      //   await auth(wallet.connectedAddress);
      // } catch (error) {
      //   return;
      // }

      // if (localStorage.getItem("jwt")) {
      //   document.getElementById("game-start").style.visibility = "unset";
      //   document.getElementById("connect").style.visibility = "hidden";
      //   document.getElementById("wallet-address").textContent = shortAddress(
      //     wallet.connectedAddress
      //   );
      //   getUserInfo();
      // }

      buttonConnectWallet.style.display = "none";
      walletDropdown.style.display = "block";
      walletAddress.textContent = shortAddress(accounts[0]);
    } catch (error) {
      console.error(error);
    }

    if (this.address) {
      console.log("connected to", this.address);
      // hide modal
      selectWalletModal.hide();
      walletDropdown.style.display = "block";
      walletAddress.textContent = shortAddress(this.address);
    }
  },

  disconnect() {
    window.localStorage.removeItem("isConnected");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("jwt.")) {
        localStorage.removeItem(key);
      }
    });

    this.setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      walletExtensions: null,
    });

    GameStats.resetAll();

    buttonConnectWallet.style.display = "block";
    walletDropdown.style.display = "none";
  },

  // Event handling
  listeners: [],

  addWalletStateListener(callback) {
    this.listeners.push(callback);
  },

  removeWalletStateListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  },

  emitWalletStateChange() {
    const state = {
      isConnected: this.walletState.isConnected,
      address: this.walletState.address,
      chainId: this.walletState.chainId,
    };

    this.listeners.forEach((listener) => listener(state));
  },

  // Initialize wallet
  async initialize() {
    console.log("initialize");
    // this.setWalletState = this.setWalletState.bind(this);
  },
};

async function displayWalletExtensions() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (window.starknet_braavos) {
    connectBraavosWallet.disabled = false;
  }
  if (window.starknet_argentX) {
    connectArgentXWallet.disabled = false;
  }
  if (window.starknet_keplr) {
    connectKeplrWallet.disabled = false;
  }
}

displayWalletExtensions();

connectBraavosWallet.addEventListener("click", () => {
  WalletManager.connect("braavos");
  connectBraavosWallet.blur();
});

connectArgentXWallet.addEventListener("click", () => {
  WalletManager.connect("argentx");
  connectArgentXWallet.blur();
});

connectKeplrWallet.addEventListener("click", () => {
  WalletManager.connect("keplr");
  connectKeplrWallet.blur();
});

disconnectButton.addEventListener("click", WalletManager.disconnect);

// Initialize wallet on load
WalletManager.initialize();

// Create API object
window.ApiUtils = {
  async updateUserInfo() {
    if (!WalletManager.address) {
      console.log("No address provided");
      return;
    }
    const { ticketsCount, bestScore } = await getAPI(
      `player/${WalletManager.address}`,
      false
    );
    GameStats.updateTickets(ticketsCount);
    GameStats.updateBestScore(bestScore);
  },

  async auth() {
    const address = WalletManager.address;
    if (!address) {
      return;
    }

    // Decode JWT
    const jwt = getAndValidateJWT(address);
    if (jwt) {
      return;
    }

    //! GET NONCE
    const nonceData = await getAPI(`player/nonce?address=${address}`, false);

    if (!nonceData) {
      console.log("No nonce found");
      return;
    }

    const signature = await window.starknet_selected.account.signMessage(
      nonceData.signMessage,
      address
    );

    if (!signature) return;

    // const signatureHex = encodeSignature(signature);

    //! UPDATE JWT
    const { accessToken } = await postAPI(
      `player/jwt`,
      { address, signature },
      false
    );

    if (accessToken) {
      localStorage.setItem(`jwt.${Constants.GAME_ID}`, accessToken);
    }
  },

  async startSession() {
    const { session } = await postAPI(`session/start`, {}, true);
    console.log("session", session);
    ApiUtils.updateUserInfo();
    return session;
  },

  async endSession({ session, score, meta }) {
    const { session: sessionResponse } = await postAPI(
      `session/end`,
      { session, score, meta },
      true
    );
    console.log("sessionResponse", sessionResponse);
    ApiUtils.updateUserInfo();
    return sessionResponse;
  },
};

// Initialize DOM elements
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const positionElement = document.getElementById("my-position");
const ticketElement = document.getElementById("ticket");

// GameScore object with all methods
window.GameStats = {
  // Private state
  _currentScore: 0,
  _bestScore: 0,
  _currentPosition: 0,
  _tickets: 0,

  // Update display methods
  updateScore(newScore) {
    this._currentScore = newScore;
    scoreElement.textContent = this._currentScore;
  },

  updateBestScore(newBestScore) {
    this._bestScore = newBestScore;
    bestScoreElement.textContent = this._bestScore;
  },

  updatePosition(newPosition) {
    this._currentPosition = newPosition;
    positionElement.textContent = this._currentPosition;
  },

  updateTickets(newTickets) {
    this._tickets = newTickets;
    ticketElement.textContent = this._tickets;
  },

  // Getter methods
  getCurrentScore() {
    return this._currentScore;
  },

  getBestScore() {
    return this._bestScore;
  },

  getCurrentPosition() {
    return this._currentPosition;
  },

  getTickets() {
    return this._tickets;
  },

  // Reset methods
  resetScore() {
    this.updateScore(0);
  },

  resetAll() {
    this.updateScore(0);
    this.updatePosition(0);
    this.updateTickets(0);
    this.updateBestScore(0);
  },
};

ensureTrailingSlash();

loadMarkdown();

// console.clear();

console.log(
  `%c
                                                                  
       ·▄▄▄▄  ▄• ▄▌• ▌ ▄ ·. ▄▄▄▄·     ▄▄▄·▄▄▌   ▄▄▄·  ▄· ▄▌       
       ██▪ ██ █▪██▌·██ ▐███▪▐█ ▀█▪   ▐█ ▄███•  ▐█ ▀█ ▐█▪██▌       
       ▐█· ▐█▌█▌▐█▌▐█ ▌▐▌▐█·▐█▀▀█▄    ██▀·██▪  ▄█▀▀█ ▐█▌▐█▪       
       ██. ██ ▐█▄█▌██ ██▌▐█▌██▄▪▐█   ▐█▪·•▐█▌▐▌▐█ ▪▐▌ ▐█▀·.       
       ▀▀▀▀▀•  ▀▀▀ ▀▀  █▪▀▀▀·▀▀▀▀    .▀   .▀▀▀  ▀  ▀   ▀ •        
                                                                  
            PLAY STUPID GAMES, WIN STUPID PRIZES!                 
                                                                  
░░░░░░░░░░░░░█▓███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░███▓██▓▓▓██▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░██░▒▓▓▓▓░░░▓▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░█████▓██████▒▒█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓████░░░
░░░░░░░░██▒▒▒▓▓░░░░░░███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓███▒█░░░░
░░░░░░████▒▓▓▒░░░░░▒░░░███░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒███▓█░░░░░░
░░░░░▓██▓▓█▓▓▒▒▒░░▒██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░██▓██░░░░░░░░
░░░░░█▓▒▒▓████▓▒░░░░░▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░█████░░░░░░░░░░
░░░████▒▒▓▒▓█████▓▓▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░█████░░░░░░░░░░░░
░░███▓▓█▒░░░░▒██▓░░░▒▓░░░░░░░░░░░░░░░░░░░░░░░░░██▓▓▓░░░░░░░░░░░░░░
░██▒▓█▓▓██▓▒░░░░░░░▒░▒▒░░░░░░░░░░░░░░░░░░░░░░██▓▓▒▓▓██░░░░░░░░░░░░
░██▒▒██▒▓▒░▓▓█▓▒░░▒▒░▒█░░░░░░░░░░░░░░░░░░░░██▓▓▒▓▒▒░▓██░░░░░░░░░░░
░██▓▒▓▓▓▓▓░░░░░░▒▒░░▒▒█░░░░░░░░░░░░░░░░░░░█▓█▒███▓▓▓█▓██░░░░░░░░░░
░███▓▒▓█▓█▓░░░▒░░▒░▒▓▒▓░░░░░░░░░░░░░░░░░█▓█▓▒░░░░▓▓▒▒▒▒█░░░░░░░░░░
░█▓▒▓▓▓█▓▓█▓▒▒▒▒▒░▒▓▒▓▒█░░░░░░░░░░░░░░█▓▓█▓▒░▓▒░░░▒▒▒░▒▓██░░░░░░░░
░███▓▓▒▓█▓▓▓█▓░░░▒▒░▒▓▓█░░░░░░░░░░░░███████░░█░░░░▒▓▒▓█▓▓▓█▒░░░░░░
░░██▓█▓▓█▓▓▓▓░▓▒▒█▓░░▒▓░░░░░░░░░░░▓███▓▓▓██░█▒░░░▒▒▓▓█▓▒▒▒▓█░░░░░░
░░░██▓▓██▒▓▓▓░▓▒███░░▒▒░░░░░░░░░▒██░░█████▓░█░░▓█████▓▒▒▒▒▒██░░░░░
░░░░█████▒▓▒▒░▒░▒██░░▓█████░░░░██░░░░███████░░▒▓▓▓█▓▒▒▒▒▒▓█▒███░░░
░░░░░░███▓█▓▒░░░░░▓█▓▒░░░▒█░░██░░░░░░░░░░░░░░░░▒▓▒░░░░▒▓█▓▒█▓▒█░░░
░░░░░░░░████▓▓███▓▓█████░░░██░░░░░░░░░░░░█▒░░░░░░░░▓█▓▓▒▒▒█▓▒▒▓█░░
░░░░░░░░░░░█▓█░░░░░░░█▒░▓███░░░░░░░░░░░░░█▒░░░░░▒▒▒░░░░▒▓▒█▒▒▒██░░
░░░░░░░░░░░█▓█░░░░░░░░████▒█░░░░░░░░░░░░░▓░▒░░░░░░░░░░▒▓▓▓▓▒▓▓▓█░░
░░░░░░░░░░░█░▒▒░░░░░░░░░░▒░░░░░░░░░░░░░░▓▒▒▒▒░░░░░░░░▒▓▓▓▓▒▒▓▓▓█░░`,
  "color: pink ; background-color: black; overflow: hidden; font-family: monospace;"
);
// warning
console.log(
  "%cWARNING: Any attempt to manipulate game results will result in a permanent account suspension!!!",
  "color: black; background-color: pink; font-size: 20px; padding: 10px 20px; font-weight: bold"
);
