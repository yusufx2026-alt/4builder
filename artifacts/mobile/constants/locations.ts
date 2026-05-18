export interface Governorate {
  id: string;
  name: string;
  nameAr: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  nameAr: string;
  governorateId: string;
}

export const GOVERNORATES: Governorate[] = [
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

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "karkh", name: "Karkh", nameAr: "الكرخ", governorateId: "baghdad" },
  { id: "rusafa", name: "Rusafa", nameAr: "الرصافة", governorateId: "baghdad" },
  { id: "karada", name: "Karada", nameAr: "الكرادة", governorateId: "baghdad" },
  { id: "mansour", name: "Mansour", nameAr: "المنصور", governorateId: "baghdad" },
  { id: "sadr_city", name: "Sadr City", nameAr: "مدينة الصدر", governorateId: "baghdad" },
  { id: "adhamiya", name: "Adhamiya", nameAr: "الأعظمية", governorateId: "baghdad" },
  { id: "shaab", name: "Shaab", nameAr: "الشعب", governorateId: "baghdad" },
  { id: "basra_center", name: "Basra Center", nameAr: "مركز البصرة", governorateId: "basra" },
  { id: "zubayr", name: "Zubayr", nameAr: "الزبير", governorateId: "basra" },
  { id: "qurna", name: "Qurna", nameAr: "القرنة", governorateId: "basra" },
  { id: "mosul_center", name: "Mosul Center", nameAr: "مركز الموصل", governorateId: "nineveh" },
  { id: "hamdaniya", name: "Hamdaniya", nameAr: "الحمدانية", governorateId: "nineveh" },
  { id: "erbil_center", name: "Erbil Center", nameAr: "مركز أربيل", governorateId: "erbil" },
  { id: "ankawa", name: "Ankawa", nameAr: "عنكاوا", governorateId: "erbil" },
  { id: "kirkuk_center", name: "Kirkuk Center", nameAr: "مركز كركوك", governorateId: "kirkuk" },
  { id: "najaf_center", name: "Najaf Center", nameAr: "مركز النجف", governorateId: "najaf" },
  { id: "karbala_center", name: "Karbala Center", nameAr: "مركز كربلاء", governorateId: "karbala" },
];

export function getNeighborhoodsByGovernorate(governorateId: string): Neighborhood[] {
  return NEIGHBORHOODS.filter((n) => n.governorateId === governorateId);
}
