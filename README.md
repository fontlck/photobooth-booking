# Photobooth Booking (Google Sheets + Calendar)

## โครงสร้าง
- index.html — UI + Calendar
- app.js — ลอจิกเรียก API และแสดงผล
- calendar.js — ปฏิทินรายเดือน + สีแท็กตามโมเดล
- api.js — ตั้งค่า URL ของ Google Apps Script (แก้ `YOUR_APPSCRIPT_URL_HERE`)
- code.gs — โค้ดฝั่ง Google Apps Script (API)

## ตั้งค่า Google Sheets
สร้างชีต 2 อัน: `Events`, `Models` พร้อม header แถวแรกดังนี้

**Events**
id,eventName,location,mapLink,model,startDate,endDate,staff,installDate,installTime,openTime,closeTime,price,transportFee,note,paidDeposit,paidFull

**Models**
id,name,size,colorBG,colorText

## Apps Script
1) Extensions > Apps Script > วางโค้ดจาก `code.gs`
2) Deploy เป็น Web app:
   - Execute as: Me
   - Who has access: Anyone
3) คัดลอก URL มาใส่ที่ `api.js` → `BASE_URL`

## การใช้งาน
- เปิด `index.html` ในเบราว์เซอร์ หรือโฮสต์บน GitHub Pages/Netlify/Vercel
- เพิ่มโมเดล (กำหนดสีพื้น/ตัวอักษร) → เพิ่มงาน
- ปฏิทินจะแสดงงานแต่ละวัน พร้อมแท็กสีตามโมเดล
