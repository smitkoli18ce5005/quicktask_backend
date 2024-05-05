const express = require('express');
const cors = require('cors');
var Parse = require('parse/node');
const jwt = require('jsonwebtoken');
require('dotenv').config();

Parse.initialize(process.env.PARSE_APP_ID, process.env.PARSE_JS_KEY, process.env.PARSE_MASTER_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/'
const secretKey = 'Secret_Key';
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token expired or invalid' });
      }
      req.user = decoded;
      next();
    });
};
const app = express();
app.use(cors())
app.use(express.json());
const port = 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
  

app.get('/', (req, res) => {
    res.send('Application running!');
});


app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    try {
      const query = new Parse.Query(Parse.User);
      query.equalTo('username', username);
      const existingUser = await query.first();
  
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      const user = new Parse.User();
      user.set('username', username);
      user.set('password', password);
  
      await user.signUp();
  
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const query = new Parse.Query(Parse.User);
      query.equalTo('username', username);
      const user = await query.first();
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid username name does\'nt exist' });
      }
  
      var isPasswordValid = false;
      var token;
      try {
            isPasswordValid= await Parse.User.logIn(username, password);
            if (isPasswordValid) {
                token = jwt.sign({ username: user.get('username') }, secretKey, { expiresIn: '24h' });
            }
        } catch (error) {
            console.error('Error:', error);
            return res.status(401).json({ error: 'Invalid password' });
        } 
        res.status(200).json({ token });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/task/getall', verifyToken, async (req, res) => {
    try {
        const { username } = req.user;
        const Task = Parse.Object.extend('Task');
        const query = new Parse.Query(Task);
        query.equalTo('username', username);
        const tasks = await query.find();
        res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Error fetching tasks' });
    }
});


app.post('/task/add', verifyToken, async (req, res) => {
    try {
      const { title, username, done } = req.body;
  
      const Task = Parse.Object.extend('Task');
      const task = new Task();
  
      task.set('title', title);
      task.set('username', username);
      task.set('done', done);
  
      const savedTask = await task.save();
  
      res.status(201).json(savedTask);
    } catch (error) {
      console.error('Error saving task:', error);
      res.status(500).json({ error: 'Error saving task' });
    }
});


app.patch('/task/update', verifyToken, async (req, res) => {
    try {
      const { objectId, done } = req.body;

      const Task = Parse.Object.extend('Task');
      const query = new Parse.Query(Task);
      const task = await query.get(objectId);
  
      task.set('done', done); 
  
      const updatedTask = await task.save();
  
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Error updating task' });
    }
});


app.delete('/task/delete', verifyToken, async (req, res) => {
    try {
      const { objectId } = req.body;
  
      const Task = Parse.Object.extend('Task');
      const query = new Parse.Query(Task);
      const task = await query.get(objectId);
  
      await task.destroy();
  
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Error deleting task' });
    }
});