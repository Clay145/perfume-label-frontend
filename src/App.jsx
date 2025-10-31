import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import axios from "axios";

export default function App() {
  const [perfumeName, setPerfumeName] = useState("");
  const [shopName, setShopName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [copies, setCopies] = useState(1);
  const [labelWidth, setLabelWidth] = useState(80);
  const [labelHeight, setLabelHeight] = useState(40);
  const [borderRadius, setBorderRadius] = useState(0);
  const [fontSettings, setFontSettings] = useState({
    perfumeFont: "Poppins",
    perfumeSize: 16,
    shopFont: "Merriweather",
    shopSize: 14,
    priceFont: "Roboto",
    priceSize: 14,
    quantityFont: "Roboto",
    quantitySize: 14,
  });
  const [templates, setTemplates] = useState([{ perfumeName: "" }]);

  const handleAddTemplate = () => {
    setTemplates([...templates, { perfumeName: "" }]);
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await axios.post("http://localhost:5000/generate-pdf", {
        perfumeName,
        shopName,
        price,
        quantity,
        copies,
        labelWidth,
        labelHeight,
        borderRadius,
        fontSettings,
        templates,
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("حدث خطأ أثناء إنشاء الملف. يرجى المحاولة مجدداً.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center p-4">
      <motion.h1
        className="text-3xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        مولّد ملصقات العطور
      </motion.h1>

      <div className="w-full max-w-lg space-y-4">
        {/* بيانات العطر */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="font-semibold text-lg text-gray-700">🧴 بيانات العطر</CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>اسم العطر</Label>
              <Input value={perfumeName} onChange={(e) => setPerfumeName(e.target.value)} placeholder="أدخل اسم العطر" />
            </div>
            <div>
              <Label>اسم المحل</Label>
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="أدخل اسم المحل" />
            </div>
            <div>
              <Label>السعر (دج)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="مثلاً: 1500" />
            </div>
            <div>
              <Label>الكمية (×)</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="مثلاً: 100" />
            </div>
            <div>
              <Label>عدد النسخ</Label>
              <Input type="number" min="1" max="35" value={copies} onChange={(e) => setCopies(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الملصق */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="font-semibold text-lg text-gray-700">📏 إعدادات الملصق</CardHeader>
          <CardContent className="space-y-3">
            <Label>العرض (مم)</Label>
            <Slider value={[labelWidth]} min={20} max={210} step={1} onValueChange={(v) => setLabelWidth(v[0])} />
            <Label>الارتفاع (مم)</Label>
            <Slider value={[labelHeight]} min={20} max={297} step={1} onValueChange={(v) => setLabelHeight(v[0])} />
            <Label>زاوية الملصق</Label>
            <Slider value={[borderRadius]} min={0} max={30} step={1} onValueChange={(v) => setBorderRadius(v[0])} />
          </CardContent>
        </Card>

        {/* إعدادات الخط */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="font-semibold text-lg text-gray-700">✏️ إعدادات الخط</CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>خط اسم العطر</Label>
              <Select onValueChange={(v) => setFontSettings({ ...fontSettings, perfumeFont: v })}>
                <SelectTrigger><SelectValue placeholder={fontSettings.perfumeFont} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                </SelectContent>
              </Select>
              <Label>حجم الخط</Label>
              <Slider value={[fontSettings.perfumeSize]} min={10} max={30} step={1}
                onValueChange={(v) => setFontSettings({ ...fontSettings, perfumeSize: v[0] })} />
            </div>
            <div>
              <Label>خط اسم المحل</Label>
              <Select onValueChange={(v) => setFontSettings({ ...fontSettings, shopFont: v })}>
                <SelectTrigger><SelectValue placeholder={fontSettings.shopFont} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                </SelectContent>
              </Select>
              <Label>حجم الخط</Label>
              <Slider value={[fontSettings.shopSize]} min={10} max={30} step={1}
                onValueChange={(v) => setFontSettings({ ...fontSettings, shopSize: v[0] })} />
            </div>
          </CardContent>
        </Card>

        {/* القوالب */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="font-semibold text-lg text-gray-700">📋 القوالب (Templates)</CardHeader>
          <CardContent className="space-y-3">
            {templates.map((t, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`اسم العطر رقم ${i + 1}`}
                  value={t.perfumeName}
                  onChange={(e) => {
                    const updated = [...templates];
                    updated[i].perfumeName = e.target.value;
                    setTemplates(updated);
                  }}
                />
              </div>
            ))}
            <Button onClick={handleAddTemplate} variant="outline">➕ إضافة عطر آخر</Button>
          </CardContent>
        </Card>

        {/* زر الطباعة */}
        <motion.div className="flex justify-center pt-4" whileHover={{ scale: 1.05 }}>
          <Button onClick={handleGeneratePDF} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg shadow-md">
            🖨️ طباعة الملصق
          </Button>
        </motion.div>
      </div>
    </div>
  );
}