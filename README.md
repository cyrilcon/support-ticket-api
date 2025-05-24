# Support Ticket API

# Navigation

- [Application Description](#application-description)
- [Environment Configuration](#environment-configuration)
- [Database Structure](#database-structure)
- [API Documentation](#api-documentation)
  - [Create Request](#create-request)
  - [Take Request in Work](#take-request-in-work)
  - [Complete Request](#complete-request)
  - [Cancel Request](#cancel-request)
  - [Get Requests (with Optional Date Filtering)](#get-requests-with-optional-date-filtering)
  - [Cancel All "In Progress" Requests](#cancel-all-in-progress-requests)
- [Running the Application](#running-the-application)
- [Running the Application with Docker](#running-the-application-with-docker)

# Application Description

This API provides a simple and anonymous system for handling user support tickets. Each ticket goes through a defined
lifecycle — from creation to completion or cancellation — and can be filtered by specific dates or date ranges.

It is designed for backend services or systems that require basic support request tracking without user authentication.

## Application Features:

- Create anonymous support requests with a topic and description.
- Update request status to "New", "In Progress", "Done", or "Cancelled".
- Add solution text when completing a request.
- Add cancellation reason when cancelling a request.
- Filter requests by specific date or date range.
- Cancel all requests that are currently "In Progress".

## Technology Stack:

- **Node.js**: JavaScript runtime.
- **Express.js**: Minimal and flexible web framework for Node.js.
- **Sequelize**: Promise-based ORM for Node.js.
- **PostgreSQL**: Relational database.
- **Joi**: Data validation library for schemas.
- **dotenv**: Loads environment variables from `.env`.
- **morgan**: HTTP request logger middleware.
- **cors**: Middleware for enabling CORS.
- **nodemon** (dev): Auto-restart server during development.
- **prettier** (dev): Code formatter.

# Environment Configuration

| Parameter     | Description                                 | Default value             |
|---------------|---------------------------------------------|---------------------------|
| `APP_PORT`    | Port on which the app will run              | `3000`                    |
| `DB_NAME`     | Name of the PostgreSQL database             | `support_ticket`          |
| `DB_USER`     | Database user                               | `postgres`                |
| `DB_PASSWORD` | Password for the database user              | `postgres`                |
| `DB_HOST`     | Host of the database (container name/local) | `support_ticket_postgres` |
| `DB_PORT`     | Port on which PostgreSQL is running         | `5432`                    |

> [!WARNING]\
> Before starting the application, create a `.env` file and specify all variables. A sample of environment variables is
> provided in the `.env.template` file.

# Database Structure

The application uses PostgreSQL and includes only one table: `requests`.

## **Table `requests`**

| Field                | Type                     | Description                                                  |
|----------------------|--------------------------|--------------------------------------------------------------|
| `id`                 | Integer                  | Auto-incremented primary key                                 |
| `topic`              | String                   | Subject/topic of the support request                         |
| `text`               | Text                     | Description or message of the support request                |
| `status`             | Enum                     | Request status: `new`, `in_progress`, `done`, or `cancelled` |
| `solution`           | Text \| Null             | *(Optional)* Text with the solution for completed requests   |
| `cancellationReason` | Text \| Null             | *(Optional)* Reason provided when cancelling the request     |
| `createdAt`          | Timestamp with time zone | Timestamp of request creation                                |
| `updatedAt`          | Timestamp with time zone | Timestamp of last update                                     |

**ORM Model:**

```js
class Request extends Model {
}

Request.init(
  {
    topic: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("new", "in_progress", "done", "cancelled"),
      defaultValue: "new",
      allowNull: false,
    },
    solution: { type: DataTypes.TEXT },
    cancellationReason: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: "Request",
    tableName: "requests",
    timestamps: true,
  },
);
```

# API Documentation

# Create Request

Create a new anonymous request with a topic and description.

## HTTP Method & URL

```
POST /api/v1/requests
```

## Description

This endpoint allows clients to create a new anonymous request by providing a topic and description.

## Request Headers

| Header         | Required | Description                |
|----------------|----------|----------------------------|
| `Content-Type` | Yes      | Must be `application/json` |

## Request Body

| Field   | Type   | Required | Description                |
|---------|--------|----------|----------------------------|
| `topic` | string | Yes      | Topic of the request       |
| `text`  | string | Yes      | Description of the problem |

```json
{
  "topic": "Login issue",
  "text": "Unable to login with valid credentials."
}
```

## Example Request (cURL)

```bash
curl -X POST "http://localhost:3000/api/v1/requests" \
-H "Content-Type: application/json" \
-d '{"topic": "Login issue", "text": "Unable to login"}'
```

## Response

### Success Response

**Status:** `201 Created`

```json
{
  "id": 1,
  "topic": "Login issue",
  "text": "Unable to login with valid credentials.",
  "status": "new",
  "solution": null,
  "cancellationReason": null,
  "createdAt": "2025-05-24T08:43:30.635Z",
  "updatedAt": "2025-05-24T08:43:30.635Z"
}
```

### Error Responses

| Status Code | Description                                  |
|-------------|----------------------------------------------|
| `400`       | Validation error (missing or invalid fields) |
| `500`       | Internal server error                        |

# Take Request in Work

Mark a request as _"in progress"_.

## HTTP Method & URL

```
POST /api/v1/requests/:id/take
```

## Description

Marks a request with the given ID as being worked on by updating its status to `in_progress`.

## Request Headers

| Header         | Required | Description                |
|----------------|----------|----------------------------|
| `Content-Type` | Yes      | Must be `application/json` |

## Request Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `id`      | string | Yes      | ID of the request |

## Request Body

This endpoint does not require a request body.

## Example Request (cURL)

```bash
curl -X POST "http://localhost:3000/api/v1/requests/1/take"
```

## Response

### Success Response

**Status:** `200 OK`

```json
{
  "id": 1,
  "topic": "Login issue",
  "text": "Unable to login with valid credentials.",
  "status": "in_progress",
  "solution": null,
  "cancellationReason": null,
  "createdAt": "2025-05-24T08:43:30.635Z",
  "updatedAt": "2025-05-24T08:48:35.185Z"
}
```

### Error Responses

| Status Code | Description                     |
|-------------|---------------------------------|
| `404`       | Request with given ID not found |
| `500`       | Internal server error           |

# Complete Request

Mark a request as completed with a solution description.

## HTTP Method & URL

```
POST /api/v1/requests/:id/complete
```

## Description

Completes the request and attaches a solution to it. Status is updated to `done`.

## Request Headers

| Header         | Required | Description                |
|----------------|----------|----------------------------|
| `Content-Type` | Yes      | Must be `application/json` |

## Request Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `id`      | string | Yes      | ID of the request |

## Request Body

| Field      | Type   | Required | Description                  |
|------------|--------|----------|------------------------------|
| `solution` | string | Yes      | Text describing the solution |

```json
{
  "solution": "Issue was caused by expired token."
}
```

## Example Request (cURL)

```bash
curl -X POST "http://localhost:3000/api/v1/requests/1/complete" \
-H "Content-Type: application/json" \
-d '{"solution": "Rebooted the system"}'
```

## Response

### Success Response

**Status:** `200 OK`

```json
{
  "id": 1,
  "topic": "Login issue",
  "text": "Unable to login with valid credentials.",
  "status": "done",
  "solution": "Issue was caused by expired token.",
  "cancellationReason": null,
  "createdAt": "2025-05-24T08:43:30.635Z",
  "updatedAt": "2025-05-24T08:50:49.124Z"
}
```

### Error Responses

| Status Code | Description                           |
|-------------|---------------------------------------|
| `400`       | Validation error (missing `solution`) |
| `404`       | Request with given ID not found       |
| `500`       | Internal server error                 |

# Cancel Request

Cancel a request and provide a reason.

## HTTP Method & URL

```
POST /api/v1/requests/:id/cancel
```

## Description

Cancels a request with the given ID and updates its status to `cancelled`. Requires a reason to be provided in the
request body.

## Request Headers

| Header         | Required | Description                |
|----------------|----------|----------------------------|
| `Content-Type` | Yes      | Must be `application/json` |

## Request Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `id`      | string | Yes      | ID of the request |

## Request Body

| Field    | Type   | Required | Description             |
|----------|--------|----------|-------------------------|
| `reason` | string | Yes      | Reason for cancellation |

```json
{
  "reason": "User duplicated the request"
}
```

## Example Request (cURL)

```bash
curl -X POST "http://localhost:3000/api/v1/requests/1/cancel" \
-H "Content-Type: application/json" \
-d '{"reason": "Already resolved"}'
```

## Response

### Success Response

**Status:** `200 OK`

```json
{
  "id": 1,
  "topic": "Login issue",
  "text": "Unable to login with valid credentials.",
  "status": "cancelled",
  "solution": null,
  "cancellationReason": "User duplicated the request",
  "createdAt": "2025-05-24T08:43:30.635Z",
  "updatedAt": "2025-05-24T08:57:10.284Z"
}
```

### Error Responses

| Status Code | Description                         |
|-------------|-------------------------------------|
| `400`       | Validation error (missing `reason`) |
| `404`       | Request with given ID not found     |
| `500`       | Internal server error               |

# Get Requests (with Optional Date Filtering)

Fetches a list of support requests. Optionally supports filtering by exact date or date range (`from` / `to`).

## HTTP Method & URL

```
GET /api/v1/requests
```

## Description

Returns all existing support requests. You can filter results by:

- a specific date (`date`);
- a date range (`from`, `to`);
- or use `from` and `to` independently (e.g., all requests after a certain date).

If no parameters are specified, all requests will be returned.

## Query Parameters

| Parameter | Type   | Required | Description                                                              |
|-----------|--------|----------|--------------------------------------------------------------------------|
| `date`    | string | No       | ISO-formatted date (`YYYY-MM-DD`). Returns requests created on that day. |
| `from`    | string | No       | Start of the date range (inclusive). Format: `YYYY-MM-DD`.               |
| `to`      | string | No       | End of the date range (inclusive). Format: `YYYY-MM-DD`.                 |

> [!NOTE]\
> `date` overrides `from` / `to` if all are provided.

## Request Headers

| Header         | Required | Description                             |
|----------------|----------|-----------------------------------------|
| `Content-Type` | No       | Should be `application/json` (optional) |

## Example Requests

### Get All Requests

```bash
curl -X GET "http://localhost:3000/api/v1/requests"
```

### Get Requests for a Specific Date

```bash
curl -X GET "http://localhost:3000/api/v1/requests?date=2025-05-10"
```

### Get Requests in a Date Range

```bash
curl -X GET "http://localhost:3000/api/v1/requests?from=2025-05-01&to=2025-05-15"
```

### Get Requests After a Date

```bash
curl -X GET "http://localhost:3000/api/v1/requests?from=2025-05-20"
```

## Response

### Success Response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "topic": "Login issue",
    "text": "Unable to login with valid credentials.",
    "status": "done",
    "solution": "Reset user session.",
    "cancellationReason": null,
    "createdAt": "2025-05-10T12:00:00.000Z",
    "updatedAt": "2025-05-10T12:30:00.000Z"
  },
  ...
]
```

### Error Responses

| Status Code | Description                    |
|-------------|--------------------------------|
| `400`       | Invalid query parameter format |
| `500`       | Internal server error          |

## Notes

- Timezone: all dates are interpreted and returned in UTC (`Z`).
- If both `date` and `from`/`to` are provided, only `date` is used.
- For performance reasons, consider implementing pagination if the number of records is large.

# Cancel All "In Progress" Requests

Bulk cancel all requests currently marked as _"in progress"_.

## HTTP Method & URL

```
POST /api/v1/requests/cancel
```

## Description

Sets the status of all requests that are currently `in_progress` to `cancelled`.

## Request Headers

| Header         | Required | Description                             |
|----------------|----------|-----------------------------------------|
| `Content-Type` | No       | Should be `application/json` (optional) |

## Request Body

This endpoint does not require a request body.

## Example Request (cURL)

```bash
curl -X POST "http://localhost:3000/api/v1/requests/cancel"
```

## Response

### Success Response

**Status:** `200 OK`

```json
{
  "cancelledCount": 2,
  "cancelledRequests": [
    {
      "id": 5,
      "status": "cancelled",
      ...
    },
    {
      "id": 8,
      "status": "cancelled",
      ...
    }
  ]
}
```

### Error Responses

| Status Code | Description           |
|-------------|-----------------------|
| `500`       | Internal server error |


# Running the Application

1. Clone the repository and navigate into the project folder.

2. Create a `.env` file with the required environment variables.

> [!NOTE]\
> Each `.env` parameter is described in the [environment configuration](#environment-configuration) section.

3. Install dependencies:

    ```sh
    npm install
    ```

4. Start the application:

    ```sh
    npm start
    ```

# Running the Application with Docker

1. Navigate to the project root directory.

2. Create a `.env` file with the required environment variables.

> [!NOTE]\
> Each `.env` parameter is described in the [environment configuration](#environment-configuration) section.

3. Build and run the containers:

   ```sh
   docker compose up --build -d
   ```