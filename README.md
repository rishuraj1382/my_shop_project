<div align="center">
  <h1>
    🛒
    <br/>
    Local Marketplace Hub
  </h1>
  <p>
    A full-stack web application designed to connect local shopkeepers with their customers, featuring real-time order tracking and multi-shop support.
  </p>
</div>

---

### 📋 Features

- **Dynamic Multi-Shop Platform** Customers can search for local shops by pincode, and shopkeepers can register and manage their own digital storefront.

  *Customer View: Shop Search & Product Browsing*
  > ![Customer View](https://i.postimg.cc/Hk633FbW/Screenshot-2025-08-22-000145.png)
  > ![Customer View](https://i.postimg.cc/CMbN9RbQ/Screenshot-2025-08-22-000219.png) 
 
  *Shopkeeper View: Order & Product Management*
  > ![Shopkeeper Dashboard](https://i.postimg.cc/2SgLzwDF/Screenshot-2025-08-21-234528.png)
  > ![Shopkeeper Dashboard](https://i.postimg.cc/HkMst1qX/Screenshot-2025-08-21-235023.png)
 
---

### ✨ Key Functionality

#### For Customers:
- **Location-Based Shop Search:** Find local shops by entering a pincode.
- **Detailed Product Browsing:** View a shop's products with images, prices, and units (e.g., kg, litre, 500ml).
- **Product Search:** Filter products by name within a specific shop.
- **Shopping Cart:** Add multiple items and specify quantities before checkout.
- **Order Placement:** Place orders with full name, contact number, and delivery address.
- **Live Order Tracking:** View the real-time status of an order (Pending, Confirmed, Packed, Ready to Deliver) using a unique Order ID and live WebSocket updates.

#### For Shopkeepers:
- **Secure Registration & Login:** Shopkeepers can register their own shop with location details and log in to a private dashboard.
- **Shop Profile Management:** Update shop details, including name, address, contact number, and a background image.
- **Full Product Management (CRUD):** Add, view, edit, and delete products with detailed information.
- **Order Management Dashboard:** View and manage incoming orders, update their status, and remove completed orders. Each shopkeeper can only see their own orders.

---

### 🚀 Technologies Used

- **Frontend:** React, React Router, Tailwind CSS, Socket.IO Client, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose

---

### 💾 Backend Implementation

- **Data Segregation:** Each shopkeeper's data (products, orders) is securely linked to their user account, ensuring they can only access their own information.
- **Real-time Events:** The backend uses Socket.IO to push live order status updates to the correct customer, providing an interactive tracking experience.

### 🌐 Getting Started

To get a local copy up and running, follow these steps.

#### Prerequisites
- Node.js and npm installed.
- A free MongoDB Atlas account.

#### Installation
1. **Clone the repo**
   ```sh
   git clone [https://github.com/your_username/your_repository_name.git](https://github.com/your_username/your_repository_name.git)
   ```
2. **Setup Backend**
   - Navigate to the `backend` folder: `cd backend`
   - Install packages: `npm install`
   - Create a `.env` file and add your secret keys:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_super_secret_key
     ```
   - Start the server: `node server.js`

3. **Setup Frontend**
   - Navigate to the `frontend` folder: `cd ../frontend`
   - Install packages: `npm install`
   - Start the server: `npm start`

---

### ✨ Stay Tuned! ✨

This project is under active development. Stay tuned for more features and enhancements! 🚀
