import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr"

import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const APP_PORT = process.env.APP_PORT ?? "3000";

const DAPR_PROTOCOL = process.env.DAPR_PROTOCOL ?? "http"
const DAPR_HOST = process.env.DAPR_HOST ?? "localhost"

let DAPR_HTTP_PORT  
switch (DAPR_PROTOCOL) {
  case "http": {
    DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT
    break
  }
  case "grpc": {
    DAPR_HTTP_PORT = process.env.DAPR_GRPC_PORT
    break
  }
  default: {
    DAPR_HTTP_PORT = 3500
  }
}

const DAPR_STATE_STORE_NAME = "statestore"

const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, DAPR_STATE_STORE_NAME)

console.log(`Dapr listening on ${DAPR_HOST} , ${DAPR_HTTP_PORT}, ${DAPR_PROTOCOL}!`);

app.get('/people/:userId', async (_req, res) => {
    console.log("Get method.");

    try {
        const userId = _req.params.userId;

        const response = await client.state.get(DAPR_STATE_STORE_NAME, userId)
        console.log("Getting Order: ", response)

        if (!response) {
            throw "Could not get state.";
        }

        res.send(response);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({message: error});
    }
});

app.post('/people', async (req, res) => {
    console.log(`Post method.`);

    const body = req.body;
    console.log(`Body ${JSON.stringify(body)}`);
    const id = body.id;

    console.log("Got a new user! User ID: " + id);

    const state = [
        {
            key: id,
            value: body
        }
    ]

    try {
        await client.state.save(DAPR_STATE_STORE_NAME, state)
        console.log(`Successfully persisted user ${JSON.stringify(state)}`);
        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send({message: error});
    }
});

app.listen(APP_PORT, () => console.log(`Node App listening on port ${APP_PORT}!`));