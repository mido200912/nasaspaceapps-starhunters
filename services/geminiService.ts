import { GoogleGenAI, Type } from "@google/genai";
import type { PlanetData, CustomPlanetDetails } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const planetGenerationSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'The real name of a known exoplanet (e.g., Kepler-186f).' },
        color: { type: Type.STRING, description: "A main Tailwind CSS background color class, e.g., 'bg-blue-500'." },
        detailColor: { type: Type.STRING, description: "A secondary Tailwind CSS color class for patterns, e.g., 'bg-green-300'." },
        pattern: { type: Type.STRING, description: "A visual pattern: 'rings', 'swirls', 'spots', 'stripes', or 'none'." },
        size: { type: Type.STRING, description: "Planet size: 'small', 'medium', or 'large'." },
        hasWaterAndOxygen: { type: Type.BOOLEAN, description: "Fictional value for the game: whether the planet has water and oxygen." },
        isTempHabitable: { type: Type.BOOLEAN, description: "Fictional value for the game: whether the planet has a habitable temperature." },
      },
      required: ['name', 'color', 'detailColor', 'pattern', 'size', 'hasWaterAndOxygen', 'isTempHabitable'],
    },
};

export async function generateInitialPlanets(language: 'ar' | 'en'): Promise<PlanetData[]> {
  const prompt = language === 'ar'
    ? "Generate a list of 5 real exoplanets for a kids' game. Include their real names. For each, provide a visually descriptive color scheme (a main Tailwind CSS background color class and a detail color class), a size ('small', 'medium', or 'large'), a visual pattern ('rings', 'swirls', 'spots', 'stripes', 'none'), and boolean values for whether it's likely to have water/oxygen and a habitable temperature for game purposes."
    : "Generate a list of 5 real exoplanets for a kids' game. Include their real names. For each, provide a visually descriptive color scheme (a main Tailwind CSS background color class and a detail color class), a size ('small', 'medium', 'large'), a visual pattern ('rings', 'swirls', 'spots', 'stripes', 'none'), and boolean values for whether it's likely to have water/oxygen and a habitable temperature for game purposes.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planetGenerationSchema,
      },
    });

    const jsonText = response.text.trim();
    const planets = JSON.parse(jsonText);
    return planets as PlanetData[];
  } catch (error) {
    console.error("Error generating initial planets:", error);
    // Return fallback data if API fails
    return [
      { name: "Kepler-186f", color: "bg-red-800", detailColor: "bg-orange-500", pattern: "swirls", size: "medium", hasWaterAndOxygen: true, isTempHabitable: true },
      { name: "J1407b", color: "bg-indigo-700", detailColor: "bg-yellow-200", pattern: "rings", size: "large", hasWaterAndOxygen: false, isTempHabitable: false },
      { name: "55 Cancri e", color: "bg-slate-600", detailColor: "bg-cyan-300", pattern: "spots", size: "small", hasWaterAndOxygen: false, isTempHabitable: false },
      { name: "TRAPPIST-1e", color: "bg-blue-500", detailColor: "bg-green-300", pattern: "swirls", size: "medium", hasWaterAndOxygen: true, isTempHabitable: true },
      { name: "HD 189733b", color: "bg-sky-900", detailColor: "bg-white", pattern: "stripes", size: "large", hasWaterAndOxygen: false, isTempHabitable: true },
    ];
  }
}

export async function generateAlienDescription(planetName: string, isHabitable: boolean, language: 'ar' | 'en'): Promise<string> {
   const prompt = language === 'ar' ? (isHabitable
    ? `صف مخلوقًا فضائيًا لطيفًا وكرتونيًا يعيش على كوكب صالح للحياة اسمه "${planetName}". يجب أن يكون الوصف قصيرًا ومناسبًا لطفل عمره 7 سنوات.`
    : `صف باختصار لماذا كوكب "${planetName}" غير صالح للحياة. استخدم لغة بسيطة ومناسبة للأطفال.`)
    : (isHabitable
    ? `Describe a cute, friendly, and cartoony alien that lives on a habitable planet named "${planetName}". Keep the description short and suitable for a 7-year-old child.`
    : `Briefly describe why the planet "${planetName}" is not habitable. Use simple language suitable for children.`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
       config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating alien description:", error);
    return language === 'ar' ? "حدث خطأ أثناء التواصل مع السفينة الأم!" : "An error occurred while communicating with the mothership!";
  }
}

export async function generateCustomPlanetDescription(details: CustomPlanetDetails, language: 'ar' | 'en'): Promise<string> {
  const prompt = language === 'ar' ? `
    ولّد وصفًا قصيرًا ومثيرًا ومبتكرًا لكوكب جديد أنشأه طفل.
    اسم الكوكب: ${details.name}.
    لونه: ${details.color}.
    غلافه الجوي: ${details.atmosphere}.
    الحياة عليه: ${details.life}.
    يجب أن يكون الوصف مشجعًا جدًا ويجعل الطفل يشعر بالفخر بإبداعه. اكتب باللغة العربية.` :
    `Generate a short, exciting, and creative description for a new planet created by a child.
    Planet Name: ${details.name}.
    Color: ${details.color}.
    Atmosphere: ${details.atmosphere}.
    Life: ${details.life}.
    The description should be very encouraging and make the child feel proud of their creation. Write in English.`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating custom planet description:", error);
    return language === 'ar' ? "كوكبك رائع جدًا لدرجة أن كمبيوتر سفينتنا لم يستطع وصفه!" : "Your planet is so amazing, our ship's computer couldn't describe it!";
  }
}