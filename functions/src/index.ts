const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

import * as request from "graphql-request";

const { server, secret } = functions.config().graphql;

const client = new request.GraphQLClient(server, {
  headers: {
    "content-type": "application/json",
    "x-hasura-admin-secret": secret
  }
});

const mutation = `mutation upsert_user($email: String!, $name: String!) {
  insert_user(
    objects: {
      email: $email,
      name: $name
    },
    on_conflict: {
      constraint: user_email_key,
      update_columns: [updatedAt]
    }
  )
  {
    affected_rows
  }
}`;

exports.processSignUp = functions.auth.user().onCreate(async (user: any) => {
  console.log("User", user.email);

  try {
    await client.request(mutation, {
      email: user.email,
      name: user.displayName || "No Name"
    });
  } catch (error) {
    console.log("Error on save data to graphql engine: ", error);
    admin
      .auth()
      .deleteUser(user.uid)
      .then(function() {
        //TODO: return error on save data to hasura engine
        console.log("Successfully deleted user");
        return;
      });
  }

  const customClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": user.uid // TODO: change this by hasura response usuer.id
    }
  };

  try {
    return await admin.auth().setCustomUserClaims(user.uid, customClaims);
  } catch (error) {
    console.log(error);
    return "Error: " + error;
  }
});
