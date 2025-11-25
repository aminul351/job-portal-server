const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6v8amsy.mongodb.net/?appName=Cluster0`;

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

    const database = client.db("job-portal");
    const jobsCollection = database.collection("jobs");
    const applicationsCollection = client.db('job-portal').collection('applications')

    // jobs api
    app.get('/jobs', async (req, res) => {

      const email = req.query.email
      const query = {}
      if(email){
        query.hr_email = email
      }

      const cursor = jobsCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })




    // job getting by email 
    // app.get('/postedJob', async (req, res) => {
    //   const email = req.query.email
    //   const query = {hr_email : email}
    //   const result = await jobsCollection.find(query).toArray()
    //   res.send(result)
    // })


    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.findOne(query)
      res.send(result);

      // db.collection.findOne(query, projection, options)
    })

    app.post('/jobs', async(req, res) => {
      const jobs = req.body
      const result = await jobsCollection.insertOne(jobs)
      res.send(result)
    })


    app.post('/application', async (req, res) => {
      const application = req.body
      const result = await applicationsCollection.insertOne(application)
      res.send(result)
    })



    app.get('/application', async (req, res) => {
      const email = req.query.email;
      const query = { applicant: email }
      const result = await applicationsCollection.find(query).toArray()


      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = {_id : new ObjectId(jobId)}
        const job = await jobsCollection.findOne(jobQuery)
        application.title = job.title
        application.company = job.company
        application.company_logo = job.company_logo
        application.location = job.location

      }

      res.send(result)
    })




    app.get('/application/job/:job_id', async(req, res) => {
      const job_id = req.params.job_id
      const query = {jobId : job_id}
      const result = await applicationsCollection.find(query).toArray()
      res.send(result)
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('is cooking')
})


app.listen(port, () => {
  console.log(`job portal server is running on port ${port}`);
})