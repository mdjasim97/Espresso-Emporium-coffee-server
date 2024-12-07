const express = require('express')
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config({path: './.env.local'})

const app = express()
const port = process.env.PORT || 5000

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4000/'
    ],
    credentials: true
}


app.use(cors(corsOptions))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wukjrsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/coffeStoreDB`;

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
        const database = client.db("coffeStoreDB")
        const coffeeCollection = database.collection("coffee")

        app.get("/coffee", async (req, res) => {
            const result = await coffeeCollection.find().toArray()
            res.send(result)
        })

        app.get("/coffee/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.findOne(query)
            res.send(result)
        })

        app.post("/addCoffee", async (req, res) => {
            const coffee = req.body
            const result = await coffeeCollection.insertOne(coffee)
            res.send(result)
        })


        app.put("/updateCoffee/:id", async (req, res) => {
            const id = req.params.id
            const updateCoffee = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }

            const updateCoffeeInfo = {
                $set: {
                    coffee: updateCoffee.coffee,
                    price: updateCoffee.price,
                    category: updateCoffee.category,
                    supplier: updateCoffee.supplier,
                    chef: updateCoffee.chef,
                    taste: updateCoffee.taste,
                    details: updateCoffee.details,
                    photo: updateCoffee.photo
                    
                }
            }
            const result = await coffeeCollection.updateOne(query, updateCoffeeInfo, options)
            res.send(result)
        })


        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query)
            res.send(result)
        })

        const userCollection = database.collection("users");

        // create User 
        app.post("/users", async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })


        // users get all 
        app.get("/users", async (req, res) => {
            const cursor = userCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // users get by id \
        app.get("/users/:id", async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await userCollection.findOne(quary)
            res.send(result)
            console.log("Single User route hitting")
        })

        // users Update by id \

        app.put("/users/:id", async (req, res) => {
            const id = req.params.id;
            const reqBody = req.body
            const quary = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateData = {
                $set: {
                    email: reqBody.email
                }
            }
            const result = await userCollection.updateOne(quary, updateData, options)
            res.send(result)
            console.log("User Update route hitting")
        })

        // User Delete 
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Database successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Coffee store server start ")
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})