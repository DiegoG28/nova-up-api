# API with Nest.js, TypeScript, and TypeORM

This is an API developed with Nest.js that uses TypeScript as the programming language and TypeORM as the ORM to interact with the database.

## Configuration

Before running the application, make sure to configure the following environment variables:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=nova-up
```

These variables are necessary to establish the connection with the MySQL database.

## Installation

1. Clone this repository.

2. Install the dependencies using Yarn:

```
yarn install
```

## Docker Execution

To facilitate the setup and execution of the environment, a `docker-compose.yml` file is provided.

1. Make sure you have Docker installed on your machine.

2. Run the following command to start the database services:

```
docker-compose up
```

This will create a Docker container for the MySQL database.

## Running the Application

You can now run the application in different modes:

```
Development mode:
yarn run start

Development mode with automatic restart:
yarn run start:dev

Production mode:
yarn run start:prod
```

You can now use the API in your local environment.
