require('dotenv').config();
const express = require("express");
const cors = require("cors");
const coockieParser = require("cookie-parser");
const sequelize = require("./utils/database");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cron = require('node-cron');
const transporter = require('./utils/mail');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(coockieParser());

app.use(
  '/api-docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);

const eventRouter = require('./routes/eventRouter');
const userRouter = require('./routes/userRouter');
const newRouter = require('./routes/newRouter');
const issueRouter = require('./routes/issueRouter');
const eventRequestRouter = require('./routes/eventRequestRouter');
const feedbackRouter = require('./routes/feedbackRouter');

app.use('/api/new', newRouter);
app.use('/api/event', eventRouter);
app.use('/api/user', userRouter);
app.use('/api/issue', issueRouter);
app.use('/api/eventrequest', eventRequestRouter);
app.use('/api/feedback', feedbackRouter);

app.get("/api/public/*", (req, res, next) => {
  res.sendFile("uploads/" + req.path.substring(12).replace('%20', ' '), { root: __dirname });
});

(async () => {
  await sequelize.sync( {alter: true} );
  console.log('База данных синхронизирована');
})();

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});