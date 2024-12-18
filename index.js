const express = require('express');
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 9000

const app = express()

const corsOptions ={
    origin:['http://localhost:5173'],
    credential : true,
    optionSuccessStatus :200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://empowerlife:empowerlifeEmon@cluster0.6qudp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from EmpowerLife Server....')
  })

app.listen(port, () => console.log(`Server running on port ${port}`))