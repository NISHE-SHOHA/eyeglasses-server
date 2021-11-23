const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

//middlewere
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mht4a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('mordern_eyeglasses');
        const productCollection = database.collection('products');
        const userCollection = database.collection('users');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');

        //get all products data
        app.get('/products', async (req, res)=>{
          const cursor = productCollection.find({});
          const products = await cursor.toArray();
          res.json(products);
        });

        //get all reviews data
        app.get('/reviews', async (req, res)=>{
          const cursor = reviewsCollection.find({});
          const reviews = await cursor.toArray();
          res.json(reviews);
        });

        //Order Get all data
        app.get('/orders', async (req,res)=>{
          const cursor = ordersCollection.find({});
          const orders = await cursor.toArray();
          res.send(orders);
        })


        //get single data
        app.get('/products/:id', async(req, res)=>{
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const service = await productCollection.findOne(query);
          res.json(service);
        })

        //get users Api
        app.get('/user/:email', async(req, res)=>{
          const email = req.params.email;
          const query = { email: email };
          const user = await userCollection.findOne(query);
          let isAdmin = false;
          if(user.role === 'admin'){
              isAdmin = true;
          }
          res.json(isAdmin);
        })

        //post  products api
        app.post('/products', async (req, res) =>{
          const product = req.body;
          const result = await productCollection.insertOne(product);
          res.json(result);
        });

        //post  reviews api
        app.post('/reviews', async (req, res) =>{
          const review = req.body;
          const result = await reviewsCollection.insertOne(review);
          res.json(result);
        });

        //order post api
       app.post('/orders', async(req,res) =>{
        const order = req.body;
        console.log(order)
        const result = await ordersCollection.insertOne(order);
        console.log(result)
        res.json(result)

      });


        //users api
        app.post('/users', async(req, res) =>{
          const user = req.body;
          const result = await userCollection.insertOne(user);
          console.log(result);
          res.json(result)
        });

        app.put('/users', async (req, res) =>{
          const user = req.body;
          const filter = { email: user.email };
          const options = { upsert: true };
          const updateDoc = {$set: user};
          const result = await userCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        });

        app.put('/users/admin', async(req,res) =>{
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


        //delete products api
      app.delete('/products/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id:ObjectId(id) };
        const result = await productCollection.deleteOne(query);
        res.json(result);
        })

        //delete orders api
      app.delete('/orders/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id:ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        res.json(result);
        })
      }

    finally{
        // await client.close()
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello Mordern EyeGlasses!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})