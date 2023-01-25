import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send(`<pre>
    Let's build a mock backend for Vercel!
    1. Create users
    - POST /user/create
      Create a new account with a username and password
    - POST /user/login
      Login and authenticate to the server giving back an access token
    
    2. Create & list projects
    - POST /project
      Create a new project, should take a name and any other details that might be needed
    - GET /projects
      List all projects associated with a user
    - POST /project/upload
      Upload a JSON blob where each key corresponds to a filename, and the value is the file contents
    3. Preview a user's project
    - GET /{user}/{project-name}/*
      Display the contents of the file if it exists. 
    </pre>
  `);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});