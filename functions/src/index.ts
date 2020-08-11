import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { upsertUser } from "./services/account";

admin.initializeApp(functions.config().firebase);

exports.processSignUp = functions.auth.user().onCreate(async (user: any) => {
  console.log("User", user.email);

  let customClaims = {};

  try {
    const upUser = await upsertUser({
      email: user.email,
      name: user.displayName || "No Name",
    });
    console.log({ upUser });

    customClaims = {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": upUser.defaultRole || "anonymous",
        "x-hasura-allowed-roles": upUser.roles || ["anonymous"],
        "x-hasura-user-id": upUser.id, // TODO: change this by hasura response usuer.id
      },
    };
    console.log(customClaims);
  } catch (error) {
    console.error("Error on save data to graphql engine: ", error);
  }

  return admin.auth().setCustomUserClaims(user.uid, customClaims);
});
