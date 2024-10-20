const express = require ('express');
const cors = require ('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// Middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.up5eg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    const craftItemCollection = client.db('CheerCraftDB').collection('craftItems');
    const craftItemSubCategoriesCollection = client.db('CheerCraftDB').collection('subCategories');

    // craft-item post api
    app.post('/craft-items', async (req, res) => {
      const craftItem = req.body;
      const result = await craftItemCollection.insertOne(craftItem);
      res.send(result);
    });

    // Craft all items get api
    app.get('/craft-items', async(req, res) => {
      const result = await craftItemCollection.find().toArray();
      res.send(result);
    });

    // craft single item get api
    app.get('/craft-item/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId (id)};
      const craftItem = await craftItemCollection.findOne(query);
      res.send(craftItem);
    });

    // Craft Item Update Api
    app.put('/craft-item/:id', async(req, res) => {
      const id = req.params.id;
      const newCraftItem = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateCraftItem = {
        $set: {
          image: newCraftItem.image,
          itemName: newCraftItem.itemName,
          subCategoryName: newCraftItem.subCategoryName,
          price: newCraftItem.price,
          description: newCraftItem.description,
          rating: newCraftItem.rating,
          customization: newCraftItem.customization,
          processingTime: newCraftItem.processingTime,
          stockStatus: newCraftItem.stockStatus,
        }
      };
      const result = await craftItemCollection.updateOne(filter, updateCraftItem, options);
      res.send(result);
    });

    // Delete Craft Item
    app.delete('/craft-item/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await craftItemCollection.deleteOne(query);
      res.send(result);
    });

    // Sub-categories get api
    app.get('/craft/sub-categories', async (req, res) => {
      const result = await craftItemSubCategoriesCollection.find().toArray();
      res.send(result);
    });

    // Sub-categories filtered api
    app.get('/sub-categories/:name', async(req, res) => {
      const subCategoryName = req.params.name;
      const filter = {subCategoryName: subCategoryName};
      const result = await craftItemCollection.find(filter).toArray();
      res.send(result);
    } );



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello - Im running from cheer craft server!!')
});

app.listen(port, () => {
    console.log(`I'm listening at ${port}`)
})