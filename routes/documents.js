const express = require('express');
const router = express.Router();
const Document = require('../models/document'); // เรียกใช้งานโมเดล Document
const path = require('path');
const fs = require('fs');

// GET เอกสารทั้งหมด
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find();
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve documents', error: err.message });
    }
});

// POST เพิ่มเอกสารใหม่
router.post('/', async (req, res) => {
    const { topic, writer, content } = req.body;

    // ตรวจสอบว่าข้อมูลที่จำเป็นครบหรือไม่
    if (!topic || !writer || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const document = new Document({
        topic,
        writer,
        content
    });

    try {
        const newDocument = await document.save();
        res.status(201).json(newDocument); // ส่งข้อมูลใหม่กลับไป
    } catch (err) {
        res.status(500).json({ message: 'Failed to save document', error: err.message });
    }
});

// PUT (อัปเดต) เอกสารตาม ID
router.put('/:id', async (req, res) => {
    const { topic, writer, content } = req.body;

    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // อัปเดตเฉพาะค่าที่ส่งมาใหม่
        if (topic) document.topic = topic;
        if (writer) document.writer = writer;
        if (content) document.content = content;

        const updatedDocument = await document.save();
        res.status(200).json(updatedDocument); // ส่งข้อมูลใหม่กลับไปหลังจากการอัปเดตสำเร็จ
    } catch (err) {
        res.status(500).json({ message: 'Failed to update document', error: err.message });
    }
});

// DELETE เอกสารตาม ID
router.delete('/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        await Document.deleteOne({ _id: req.params.id }); // ลบเอกสาร
        res.json({ message: 'Document deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Route สำหรับดาวน์โหลดเอกสาร
router.get('/download/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // ตรวจสอบว่าโฟลเดอร์ downloads มีอยู่หรือไม่
        const downloadsDir = path.join(__dirname, '../downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir); // สร้างโฟลเดอร์ถ้ายังไม่มี
        }

        // สร้างไฟล์ชั่วคราวจากเนื้อหาเอกสารเพื่อให้ดาวน์โหลด
        const filePath = path.join(downloadsDir, `${document._id}.txt`);
        const fileContent = `Topic: ${document.topic}\nWriter: ${document.writer}\nContent: ${document.content}`;
        
        // เขียนเนื้อหาเอกสารลงในไฟล์
        fs.writeFileSync(filePath, fileContent);

        // ตั้งค่า Headers ก่อนการดาวน์โหลด
        res.setHeader('Content-Disposition', `attachment; filename="${document.topic}.txt"`);
        res.setHeader('Content-Type', 'text/plain');

        // ส่งไฟล์ให้กับผู้ใช้เพื่อดาวน์โหลด
        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ message: 'Failed to download document' });
            } else {
                // ลบไฟล์ชั่วคราวหลังจากส่งให้ผู้ใช้แล้ว
                fs.unlinkSync(filePath);
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to download document', error: err.message });
    }
});

module.exports = router;