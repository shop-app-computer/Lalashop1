import { Request, Response } from "express";
import Bank from "../models/bankModel";

export const addBank = async (req: Request, res: Response) => {
  try {
    const { bankName, accountNumber, accountName } = req.body;

    // 1. ตรวจสอบว่าส่งข้อมูลมาครบไหม
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // 2. สร้างข้อมูลใหม่ (ดึง userId มาจาก req.user ที่ผ่าน middleware มา)
    const newBank = new Bank({
      user: (req as any).user.id, // สมมติว่า middleware เก็บ id ไว้ใน req.user
      bankName,
      accountNumber,
      accountName,
      isVerified: true // ตั้งค่าเริ่มต้นเป็น true หรือรอตรวจก็ได้
    });

    // 3. บันทึกลง Database
    const savedBank = await newBank.save();

    res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      data: savedBank,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// แถม: ฟังก์ชันสำหรับดึงข้อมูลธนาคารของผู้ใช้
export const getMyBank = async (req: Request, res: Response) => {
  try {
    const banks = await Bank.find({ user: (req as any).user.id });
    res.status(200).json({ success: true, data: banks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};