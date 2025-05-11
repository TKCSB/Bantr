# Backend Documentation

## Overview
The backend of this application is built using Node.js and the Express framework. It provides a RESTful API for managing users, posts, and comments. The backend interacts with a MongoDB database using Mongoose for data persistence.

## Project Structure
- **controllers/**: Contains logic for handling requests and responses for different resources.
- **models/**: Defines Mongoose schemas and models for the application.
- **routes/**: Sets up API endpoints and maps them to respective controller functions.
- **middlewares/**: Contains middleware functions for request validation and authentication.
- **lib/**: Contains utility functions and database connection logic.

## API Endpoints

### User Routes
- `POST /api/v1/users/login`: Authenticates a user.
- `POST /api/v1/users/signup`: Registers a new user.
- `GET /api/v1/users/logout`: Logs out the current user.

### Post Routes
- `POST /api/v1/posts`: Creates a new post.
- `DELETE /api/v1/posts/:postId`: Deletes a post by ID.
- `PATCH /api/v1/posts/:postId`: Updates a post by ID.
- `GET /api/v1/posts/:postId`: Retrieves a specific post.
- `GET /api/v1/posts/user/:userId`: Retrieves all posts by a specific user.
- `GET /api/v1/posts`: Retrieves all posts.
- `GET /api/v1/posts/search`: Searches for posts.
- `POST /api/v1/posts/upvote/:postId`: Upvotes a post.
- `DELETE /api/v1/posts/upvote/:postId`: Removes an upvote from a post.
- `POST /api/v1/posts/downvote/:postId`: Downvotes a post.
- `DELETE /api/v1/posts/downvote/:postId`: Removes a downvote from a post.
- `GET /api/v1/posts/upvote-count/:postId`: Gets the count of upvotes for a post.
- `GET /api/v1/posts/downvote-count/:postId`: Gets the count of downvotes for a post.

### Comment Routes
- `POST /api/v1/comments/:postId`: Creates a new comment for a post.
- `DELETE /api/v1/comments/:commentId`: Deletes a comment by ID.
- `PATCH /api/v1/comments/:commentId`: Updates a comment by ID.
- `GET /api/v1/comments/:postId`: Retrieves all comments for a post.
- `GET /api/v1/comments/:commentId`: Retrieves a specific comment.
- `POST /api/v1/comments/upvote/:commentId`: Upvotes a comment.
- `DELETE /api/v1/comments/upvote/:commentId`: Removes an upvote from a comment.
- `POST /api/v1/comments/downvote/:commentId`: Downvotes a comment.
- `DELETE /api/v1/comments/downvote/:commentId`: Removes a downvote from a comment.
- `POST /api/v1/comments/:commentId/reply`: Replies to a comment.

## Authentication
The application uses JWT (JSON Web Tokens) for authentication. Tokens are issued upon successful login and are required for accessing protected routes.

## Error Handling
The backend includes error handling for common issues such as invalid input, authentication failures, and server errors. Errors are returned as JSON responses with appropriate HTTP status codes.

## Environment Variables
The application requires certain environment variables for configuration:
- `PORT`: The port on which the server listens.
- `MONGODB_URI`: The connection string for the MongoDB database.
- `JWT_SECRET`: The secret key used for signing JWT tokens.
- `NODE_ENV`: The environment in which the application is running (e.g., development, production).

## Setup Instructions
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up a `.env` file with the necessary environment variables.
4. Start the server using `npm run dev`.

For more detailed information on each service and their functionalities, please refer to the respective files and functions within the codebase.

