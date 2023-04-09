const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
dotenv.config();

const app = express();


app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

app.use(cors({
  // Allow all origins to access your API
  origin: '*',
  // Allow all headers to be accepted
  allowedHeaders: '*'
}));

app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);


app.get('/', (req, res) => {
  res.send('API is running');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
