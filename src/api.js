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
