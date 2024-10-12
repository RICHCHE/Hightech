var express = require('express');
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('../routes/index'); // Routing สำหรับ API
var documentsRouter = require('../routes/documents'); // Routing สำหรับเอกสาร
var usersRouter = require('../routes/users'); // Routing สำหรับผู้ใช้

var app = express();

// MongoDB connection
mongoose.connect('mongodb+srv://admin:1234@hightech.dmuzq.mongodb.net/?retryWrites=true&w=majority&appName=Hightech')
.then(() => {
  console.log('MongoDB Connected');
})
.catch(err => console.error('MongoDB Connection Failed:', err));

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public'))); // เสิร์ฟไฟล์ static

// Routes
app.use('/api', indexRouter); // API routes
app.use('/api/documents', documentsRouter); // เปลี่ยนเส้นทางให้เป็น /api/documents
app.use('/api/users', usersRouter); // เปลี่ยนเส้นทางให้เป็น /api/users

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
