# Edu Forge Discussion Service - Postman Testing Guide

This guide provides instructions for testing the Edu Forge Discussion Service API using Postman.

## Files Included

- `postman_collection.json`: Contains all API requests organized by resource (Threads, Posts, Reactions)
- `postman_environment.json`: Environment variables for testing, with pre-configured test IDs

## Import Instructions

1. Open Postman
2. Click on "Import" in the top left corner
3. Drag and drop both the `postman_collection.json` and `postman_environment.json` files
4. Alternatively, click "Upload Files" and select both files
5. Click "Import" to confirm

## Setup Instructions

1. After importing, select the "Edu Forge Discussion Service - Local" environment from the environment dropdown (top right corner)
2. Verify the server is running at the URL specified in the `baseUrl` variable (default: `http://localhost:3000/api/v1/discussion`)
3. Update the test IDs in the environment variables if necessary to match your development database

## Variables Included

| Variable   | Description      | Default Value                           |
| ---------- | ---------------- | --------------------------------------- |
| baseUrl    | Base API URL     | http://localhost:3000/api/v1/discussion |
| userId     | Test user ID     | d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11    |
| courseId   | Test course ID   | e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11    |
| lessonId   | Test lesson ID   | f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11    |
| threadId   | Test thread ID   | b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11    |
| postId     | Test post ID     | c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11    |
| reactionId | Test reaction ID | d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11    |

## User Authentication

All API requests now require user authentication via the `X-User-Id` header:

- The Postman collection has been updated to automatically include the `X-User-Id` header with the value from the `userId` environment variable
- This header is used by the API to identify the current user for authorization and auditing purposes
- You can change the user ID by updating the `userId` environment variable

## Testing Workflow

Follow this sequence for end-to-end testing:

1. Create a new thread (Threads > Create Thread)
2. Use the created thread ID to create posts (Posts > Create Post)
3. Test replies by creating posts with parentId set (Posts > Create Post)
4. Add reactions to posts (Reactions > Create Reaction)
5. Test updates and deletions

## Capturing IDs for Subsequent Requests

After creating resources, you can capture IDs for subsequent requests:

1. In the Test tab of your request, add this script:

   ```javascript
   // Capture the ID from the response
   var jsonData = pm.response.json();
   pm.environment.set('threadId', jsonData.id);
   ```

2. This will automatically update your environment variable after the request is successful

## Troubleshooting

- Ensure your NestJS server is running before testing
- Check that the database has been seeded with appropriate test data
- Verify the environment variables match the UUIDs in your database
- For "Not Found" errors, check that the IDs in your requests match existing resources

## API Resources Documentation

### Threads

- Create, read, update, and delete discussion threads
- Thread types: "COURSE_REVIEW", "LESSON_DISCUSSION"

### Posts

- Create, read, update, and delete posts in threads
- Supports threaded replies (using parentId)
- Can include ratings for reviews

### Reactions

- Create, read, update, and delete reactions on posts
- Supported reaction types: "LIKE", "LOVE", "CARE", "HAHA", "WOW", "SAD", "ANGRY"
