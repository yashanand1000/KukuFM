# Audiobook App

Welcome to the Audiobook App! This application allows users to browse, filter, and review a wide range of audiobooks. Users can also manage their audiobooks, leave reviews, and interact with the audiobook community.

## Features

- **User Authentication and Authorization**: Secure user registration and login system.
- **Audiobook Management**: Users can add, edit, and delete their audiobooks.
- **Review System**: Users can leave reviews for audiobooks.
- **Filtering and Sorting**: Users can filter audiobooks by genre, title, and sort them by rating.
- **Responsive Design**: Optimized for various devices.

## Live Demo

Check out the live demo of the Audiobook App [here](https://kukufm.onrender.com/).

## Installation

Follow these steps to run the application locally:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add your MongoDB connection string and other necessary environment variables:
    ```plaintext
    DB_URL=your_mongodb_connection_string
    SECRET=your_secret_key
    ```

4. **Seed the database**:
    Run the seed script to populate the database with initial data:
    ```sh
    node seeds/index.js
    ```

5. **Start the application**:
    ```sh
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: Passport.js
- **Templating Engine**: EJS
- **Styling**: Bootstrap

## Contributing

We welcome contributions to the Audiobook App. To contribute, please fork the repository and create a pull request with your changes.


## Contact

If you have any questions or feedback, feel free to contact us at yashanand1000@gmail.com.

---

Thank you for checking out the Audiobook App! Enjoy your experience!
