# AI Fitting Labs - Playbook Manifest File

This manifest outlines the operational playbooks running inside the AI Fitting Labs plug-and-play e-commerce infrastructure.

### Playbook 1: Inline Storefront Rendering Loop
* **Operational Category:** Frontend UI & UX Delivery
* **Description:** Handles the non-redirect "See it on you" button injection and ensures it cleanly hides behind the sliding cart menu.
* **What breaks if deleted:** The entire frontend widget disappears from the merchant's store, leaving buyers with flat product images and causing immediate customer drop-offs.

### Playbook 2: Cloudflare Zero-Trust Security Gate
* **Operational Category:** Cybersecurity & Cost Management
* **Description:** Executes request validation, handles API token authentication, and enforces the strict 4-trial daily user limit.
* **What breaks if deleted:** The application loses all security parameters, exposing our server wallet to automated denial-of-wallet bot attacks and unlimited credit drain.

### Playbook 3: Generative Inference Router
* **Operational Category:** AI Architecture & Core Processing
* **Description:** Manages the REST API handshakes, delivers automated user guidance, and captures swiped garment coordinates for rendering.
* **What breaks if deleted:** The try-on button will click, but the generative engine will never receive the photo coordinates, freezing the user experience on a perpetual loading spinner.
