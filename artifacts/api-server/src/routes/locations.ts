import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GOVERNORATES = [
  { id: "baghdad", name: "Baghdad", nameAr: "بغداد" },
  { id: "basra", name: "Basra", nameAr: "البصرة" },
  { id: "nineveh", name: "Nineveh", nameAr: "نينوى" },
  { id: "erbil", name: "Erbil", nameAr: "أربيل" },
  { id: "sulaymaniyah", name: "Sulaymaniyah", nameAr: "السليمانية" },
  { id: "dohuk", name: "Dohuk", nameAr: "دهوك" },
  { id: "kirkuk", name: "Kirkuk", nameAr: "كركوك" },
  { id: "anbar", name: "Anbar", nameAr: "الأنبار" },
  { id: "babel", name: "Babel", nameAr: "بابل" },
  { id: "dhi_qar", name: "Dhi Qar", nameAr: "ذي قار" },
  { id: "diyala", name: "Diyala", nameAr: "ديالى" },
  { id: "karbala", name: "Karbala", nameAr: "كربلاء" },
  { id: "maysan", name: "Maysan", nameAr: "ميسان" },
  { id: "muthanna", name: "Muthanna", nameAr: "المثنى" },
  { id: "najaf", name: "Najaf", nameAr: "النجف" },
  { id: "qadisiyyah", name: "Qadisiyyah", nameAr: "القادسية" },
  { id: "saladin", name: "Saladin", nameAr: "صلاح الدين" },
  { id: "wasit", name: "Wasit", nameAr: "واسط" },
];

const NEIGHBORHOODS: Record<string, { id: string; name: string; nameAr: string }[]> = {
  baghdad: [
    { id: "karkh", name: "Karkh", nameAr: "الكرخ" },
    { id: "rusafa", name: "Rusafa", nameAr: "الرصافة" },
    { id: "karada", name: "Karada", nameAr: "الكرادة" },
    { id: "mansour", name: "Mansour", nameAr: "المنصور" },
    { id: "sadr_city", name: "Sadr City", nameAr: "مدينة الصدر" },
    { id: "adhamiya", name: "Adhamiya", nameAr: "الأعظمية" },
    { id: "shaab", name: "Shaab", nameAr: "الشعب" },
    { id: "dora", name: "Dora", nameAr: "الدورة" },
  ],
  basra: [
    { id: "basra_center", name: "Basra Center", nameAr: "مركز البصرة" },
    { id: "zubayr", name: "Zubayr", nameAr: "الزبير" },
    { id: "qurna", name: "Qurna", nameAr: "القرنة" },
    { id: "shatt_al_arab", name: "Shatt Al Arab", nameAr: "شط العرب" },
  ],
  nineveh: [
    { id: "mosul_center", name: "Mosul Center", nameAr: "مركز الموصل" },
    { id: "hamdaniya", name: "Hamdaniya", nameAr: "الحمدانية" },
    { id: "bartella", name: "Bartella", nameAr: "برطلة" },
  ],
  erbil: [
    { id: "erbil_center", name: "Erbil Center", nameAr: "مركز أربيل" },
    { id: "ankawa", name: "Ankawa", nameAr: "عنكاوا" },
    { id: "soran", name: "Soran", nameAr: "سوران" },
  ],
  kirkuk: [
    { id: "kirkuk_center", name: "Kirkuk Center", nameAr: "مركز كركوك" },
    { id: "hawija", name: "Hawija", nameAr: "الحويجة" },
  ],
  najaf: [
    { id: "najaf_center", name: "Najaf Center", nameAr: "مركز النجف" },
    { id: "kufa", name: "Kufa", nameAr: "الكوفة" },
  ],
  karbala: [
    { id: "karbala_center", name: "Karbala Center", nameAr: "مركز كربلاء" },
    { id: "hindiya", name: "Hindiya", nameAr: "الهندية" },
  ],
};

router.get("/locations/governorates", (_req, res): void => {
  res.json({ governorates: GOVERNORATES });
});

router.get("/locations/neighborhoods", (req, res): void => {
  const govId = req.query["governorate"] as string;
  if (!govId) {
    res.status(400).json({ error: "governorate query param required" });
    return;
  }
  const hoods = (NEIGHBORHOODS[govId] ?? []).map((n) => ({ ...n, governorateId: govId }));
  res.json({ neighborhoods: hoods });
});

export default router;
