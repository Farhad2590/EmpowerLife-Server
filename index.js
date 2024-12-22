const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 9000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


const app = express();

const corsOptions = {
  origin: ['http://localhost:5173'],
  credential: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://empowerlife:empowerlifeEmon@cluster0.6qudp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('empowerlife').collection('empowerlifeProducts');
    const cartCollection = client.db('empowerlife').collection('empowerlifeCart');
    const userCollection = client.db('empowerlife').collection('empowerlifeUsers');
    const cuponCollection = client.db('empowerlife').collection('empowerlifeCupons');
    const announcementCollection = client.db('empowerlife').collection('empowerlifeAnnouncements');
    const blogsCollection = client.db('empowerlife').collection('empowerlifeBlogs');
    const paymentCollection = client.db('empowerlife').collection('empowerlifePayments');
    const reviewCollection = client.db('empowerlife').collection('empowerlifeReviews');

    app.get('/product', async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    });
    app.post('/cart', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await cartCollection.insertOne(newProduct)
      res.send(result)
    })
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const result = await userCollection.findOne({ email })
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    });
    app.get('/cart/:email', async (req, res) => {
      const email = req.params.email;
      const result = await cartCollection.find({ userEmail: email }).toArray();
      res.status(200).json(result);
    });
    app.get('/user/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const result = await userCollection.findOne({ email }); // Ensure field name matches
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })
    app.get('/users/writer/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let writer = false;
      if (user) {
        writer = user?.role === 'writer';
      }
      res.send({ writer });
    })
    app.put('/updateUserRole/:email', async (req, res) => {
      const userEmail = req.params.email;
      const { role } = req.body;
      const result = await userCollection.updateOne(
        { email: userEmail },
        { $set: { role } }
      );
      res.send(result)
    });
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      // console.log(newProduct);
      const result = await productCollection.insertOne(newProduct)
      res.send(result)
    })
    app.get('/cupons', async (req, res) => {
      const result = await cuponCollection.find().toArray();
      res.send(result);
    });
    app.get('/coupons/:code', async (req, res) => {
      try {
        const couponCode = req.params.code;
        const coupon = await cuponCollection.findOne({ code: couponCode });

        if (coupon) {
          res.send({
            isValid: true,
            discountPercentage: coupon.discountPercentage
          });
        } else {
          res.send({
            isValid: false,
            discountPercentage: 0
          });
        }
      } catch (error) {
        res.status(500).send({
          isValid: false,
          message: 'Error validating coupon'
        });
      }
    });
    app.post('/newCupons', async (req, res) => {
      const newCupon = req.body;
      // console.log(newCupon);
      const result = await cuponCollection.insertOne(newCupon)
      res.send(result)
    })
    app.post('/newAnnouncement', async (req, res) => {
      const newProduct = req.body;
      // console.log(newProduct);
      const result = await announcementCollection.insertOne(newProduct)
      res.send(result)
    })
    app.get('/announcements', async (req, res) => {
      const result = await announcementCollection.find().toArray();
      res.send(result);
    });
    app.get('/allBlogs', async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });

    app.post('/blogs', async (req, res) => {
      const newProduct = req.body;
      // console.log(newProduct);
      const result = await blogsCollection.insertOne(newProduct)
      res.send(result)
    })
    app.get('/personalBlogs/:email', async (req, res) => {
      const email = req.params.email;
      const result = await blogsCollection.find({ writerMail: email }).toArray();
      res.status(200).json(result);
    });
    app.delete('/deleteBlogs/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);

      const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    });

    app.get('/payments/:email', async (req, res) => {
      const email = req.params.email;
      const result = await paymentCollection.find({ email: email }).toArray();
      res.status(200).json(result);
    });

    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });
    app.post('/savePayment', async (req, res) => {
      const newPayment = req.body;
      // console.log(newPayment);
      const result = await paymentCollection.insertOne(newPayment)
      res.send(result)
    })
    app.delete('/cartData', async (req, res) => {
      const productIds = req.body.productIds;  // Expecting an array of productIds

      if (!productIds || productIds.length === 0) {
        return res.status(400).send({ message: 'No product IDs provided.' });
      }

      try {
        // Assuming you're deleting from cartCollection based on productIds
        const result = await cartCollection.deleteMany({
          _id: { $in: productIds.map(id => new ObjectId(id)) } // Convert productIds to ObjectId format
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'No products found to delete.' });
        }

        res.send({ message: `${result.deletedCount} product(s) deleted successfully.` });
      } catch (err) {
        console.error('Error deleting products:', err);
        res.status(500).send({ message: 'An error occurred while deleting products.' });
      }
    });
    app.post('/reviews', async (req, res) => {
      const newPayment = req.body;
      // console.log(newPayment);
      const result = await reviewCollection.insertOne(newPayment)
      res.send(result)
    })
    app.get('/allReviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.get('/purchasedProducts/:email', async (req, res) => {
      const email = req.params.email;
      const result = await paymentCollection.find({ email: email }).toArray();
      res.status(200).json(result);
    });





    console.log("Connected to MongoDB and server is ready to handle requests!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

// Home route
app.get('/', (req, res) => {
  res.send('Hello from EmpowerLife Server...');
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
