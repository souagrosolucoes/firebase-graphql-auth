const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

import * as request from 'graphql-request';



// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const client = new request.GraphQLClient(functions.config().hasura.server, {
    headers: {
        "content-type": "application/json",
        "x-hasura-admin-secret": functions.config().hasura.secret,
    }
});

const mutation = `mutation upsertUser($id: String, $name: String!, $email: String!,) {
  insert_User(objects: {
        name: $name,
        email: $email,
        id: $id
    },
    on_conflict: {
        constraint: User_pkey1,
        update_columns: [name]}) {
            affected_rows
        }
  }`;

exports.processSignUp = functions.auth.user().onCreate(async (user: any) => {
    console.log(user);

    try {
        const response = await client.request(mutation, {
            id: user.uid,
            email: user.email,
            name: user.displayName || "No Name",
        });
        console.error("Response: " + response);
    } catch (error) {
        console.log('Error on save data to hasura engine: ', error);
        admin.auth().deleteUser(user.uid).then(function() {
            //TODO: return error on save data to hasura engine
            console.log('Successfully deleted user');
            return
        });
    }

    const customClaims = {
        'https://hasura.io/jwt/claims': {
            'x-hasura-default-role': 'user',
            'x-hasura-allowed-roles': ['user'],
            'x-hasura-user-id': user.uid
        }
    };

    try {
        await admin.auth().setCustomUserClaims(user.uid, customClaims);
        // Update real-time database to notify client to force refresh.
        const metadataRef = await admin.database().ref("metadata/" + user.uid);
        // Set the refresh time to the current UTC timestamp.
        // This will be captured on the client to force a token refresh.
        return metadataRef.set({refreshTime: new Date().getTime()});
    } catch (error) {
        console.log(error);
        return "Error: " + error
    }
});
