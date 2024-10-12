const express = require('express');
const router = express.Router();
const Document = require('../models/document'); // เรียกใช้งานโมเดล Document

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
        // ดึงเอกสารจาก MongoDB โดยใช้ ID
        const document = await Document.findById(req.params.id);
        if (!document) {
            console.log(`Document with id ${req.params.id} not found.`);
            return res.status(404).json({ message: 'Document not found' });
        }

        // สร้างเนื้อหาเอกสารเป็น Buffer
        const fileContent = `Topic: ${document.topic}\nWriter: ${document.writer}\nContent: ${document.content}`;
        const buffer = Buffer.from(fileContent, 'utf-8');

        // ตั้งค่า Headers สำหรับการดาวน์โหลด
        res.setHeader('Content-Disposition', `attachment; filename="${document.topic}.txt"`);
        res.setHeader('Content-Type', 'text/plain');

        // ส่งไฟล์ Buffer ให้กับผู้ใช้
        res.send(buffer);
    } catch (err) {
        // แสดงข้อผิดพลาดใน console และส่งสถานะ 500 กลับไป
        console.error('Error downloading document:', err.message);
        res.status(500).json({ message: 'Failed to download document', error: err.message });
    }
});

module.exports = router;
