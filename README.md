# firebase-graphql-auth

Firebase function to save user auth information on graphql server

## Dependencies

### Firebase CLI

The [Firebase Command Line Interface (CLI)](https://github.com/firebase/firebase-tools) Tools can be used to test, manage, and deploy your Firebase project from the command line.

To download and install the Firebase CLI run the following command:

```
npm install -g firebase-tools
```

## Deploy

### Set the environment variables

- `SEVER_API_URL`: Graphql API URL (i.e., `https://api.account.com/v1/graphql`)
- `SEVER_API_PASSWORD`: Respective password (i.e., the `x-hasura-admin-secret` value)

To configure the environment variables to firebase run the following command:

```shell
firebase functions:config:set graphql.server="SEVER_API_URL" \
graphql.secret='SEVER_API_PASSWORD'
```

### To deploy

After setting the environment variables,run the command following command to deploy the functions:

```shell
firebase deploy --only functions
```
