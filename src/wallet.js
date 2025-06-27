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

    WalletManager.setWalletState({
      address: null,
      isConnected: false,
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
