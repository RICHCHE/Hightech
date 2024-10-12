var express = require('express');
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

var indexRouter = require('../routes/index'); // Routing สำหรับ API
var documentsRouter = require('../routes/documents'); // Routing สำหรับเอกสาร
var usersRouter = require('../routes/users'); // Routing สำหรับผู้ใช้

var app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected');
  console.log('MongoDB URI:', process.env.MONGODB_URI); // แสดงค่า URI เมื่อเชื่อมต่อสำเร็จ
})
.catch(err => console.error('MongoDB Connection Failed:', err));

// Enable CORS
app.use(cors());

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public'))); // เสิร์ฟไฟล์ static

// Routes
app.use('/api', indexRouter); // API routes
app.use('/documents', documentsRouter);
app.use('/users', usersRouter);

// Fallback route for static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html')); // ส่งไฟล์ index.html
});

// Catch 404
app.use(function(req, res, next) {
  next(createError(404)); // ส่งต่อไปยัง middleware สำหรับจัดการ 404
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {} // แสดงข้อผิดพลาดในโหมดพัฒนา
  });
});

module.exports = app;
