class PeerService {
    constructor() {
        // Initializes a new RTCPeerConnection if it doesn't already exist, setting up STUN servers for NAT traversal
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            });
        }
    }

    // getAnswer: Sets the remote description to the provided offer, generates an answer, sets it as the local description, and returns it
    async getAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer); // Sets the received offer as remote description
            const ans = await this.peer.createAnswer(); // Creates an answer for the offer
            await this.peer.setLocalDescription(new RTCSessionDescription(ans)); // Sets the answer as the local description
            return ans; // Returns the generated answer
        }
    }

    // setLocalDescription: Sets the provided answer as the remote description to complete the connection
    async setLocalDescription(ans) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans)); // Sets the answer as remote description
        }
    }

    // getOffer: Creates and returns an offer for initiating a WebRTC connection, setting it as the local description
    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer(); // Creates an offer for initiating a connection
            await this.peer.setLocalDescription(new RTCSessionDescription(offer)); // Sets the offer as the local description
            return offer; // Returns the created offer
        }
    }
}

export default new PeerService();
