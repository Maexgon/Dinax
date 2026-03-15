import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import OpenAI from 'openai';
import { getAdminFirestore } from '@/lib/firebase-admin';

// Initialize Telegraf and OpenAI (lazy init within the handler or globally depending on env vars)
const bot = process.env.TELEGRAM_BOT_TOKEN ? new Telegraf(process.env.TELEGRAM_BOT_TOKEN) : null;
const openai = process.env.OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://dinaxapp.vercel.app", // Optional, for including your app on openrouter.ai rankings.
    "X-Title": "Dinax AI Coach", // Optional. Shows in rankings on openrouter.ai.
  }
}) : null;

// The AI prompt setting Dina's persona
const DINA_SYS_PROMPT = `Actúas como Dina, una asistente y coach deportiva de la app Dinax experta en ejercicios corporales y atención al cliente. 
Tu tono es super entusiasta, muy empático y orientado a motivar y escuchar al alumno. Eres la compañera de ruta del usuario en sus entrenamientos y su app de confianza.
Respondes siempre de forma cálida pero concisa. Usa un lenguaje natural con algunos emojis sin exagerar. No hables como un robot, no hagas listas largas. 
Si el usuario pregunta por su rutina o plan de hoy, utiliza los datos que te proveemos en tu contexto interno para responder rápidamente.
Si te hablan de dolores musculares o cansancio extremo motivale a descansar, el descanso es vital.`;

export async function POST(req: Request) {
  try {
    if (!bot || !openai) {
       console.error("Missing Bot or OpenAI credentials");
       return new Response("Missing config", { status: 500 });
    }

    const body = await req.json();

    // Fast return to acknowledge Telegram webhook
    const respondOk = (message?: string) => NextResponse.json({ ok: true, message });

    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text.trim();
      const db = getAdminFirestore();

      // Handle the /start {CODE} linking pairing logic
      if (text.startsWith('/start ')) {
        const pairingCode = text.split(' ')[1].toUpperCase();

        // Find the user with this auth code using collection group query
        const usersSnapshot = await db.collectionGroup('user_profile')
            .where('telegramAuthCode', '==', pairingCode)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
          await bot.telegram.sendMessage(chatId, "⚠️ Código de vinculación inválido o expirado. Genera uno nuevo en la web de Dinax.");
          return respondOk();
        }

        const userDoc = usersSnapshot.docs[0];
        
        // Save the Telegram Chat ID to the user profile and remove the old auth code
        await userDoc.ref.update({
            telegramChatId: chatId,
            telegramAuthCode: null, // delete it after use
        });

        const userData = userDoc.data();
        const userName = userData.name?.split(' ')[0] || "deportista";

        await bot.telegram.sendMessage(chatId, `✅ ¡Vinculación exitosa!\n\nHola ${userName}, soy Dina 👋, tu coach virtual personal de Dinax. ¿En qué te ayudo hoy? ¿Quieres saber qué nos toca entrenar?`);
        return respondOk();
      }

      // Check if this Telegram Chat ID is linked to any Dinax user
      const linkedUsers = await db.collectionGroup('user_profile')
        .where('telegramChatId', '==', chatId)
        .limit(1)
        .get();

      if (linkedUsers.empty) {
         if (!text.startsWith('/start')) {
             await bot.telegram.sendMessage(chatId, "Hola! Aún no te has vinculado con Dinax. Ve a tu perfil en la app y haz clic en 'Conectar con Telegram' para obtener tu código.");
         }
         return respondOk();
      }

      const clientProfile = linkedUsers.docs[0].data();
      const clientId = linkedUsers.docs[0].id;
      // Extract tenantId from path: tenants/{tenantId}/user_profile/{clientId}
      const tenantId = linkedUsers.docs[0].ref.parent.parent?.id;

      // 1. Fetch relevant training contextual data for today
      let todayWorkouts = '';
      if (tenantId) {
          const eventsRef = db.collection(`tenants/${tenantId}/events`);
          const now = new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          
          const eventsSnap = await eventsRef
              .where('clients', 'array-contains', clientId)
              .where('start', '>=', startOfDay)
              .where('start', '<=', endOfDay)
              .get();

          if (!eventsSnap.empty) {
             const names = eventsSnap.docs.map(doc => doc.data().title || "entrenamiento").join(", ");
             todayWorkouts = `El usuario TIENE ASIGNADO un entrenamiento para HOY: ${names}.`;
          } else {
             todayWorkouts = `El usuario NO tiene nada agendado para hoy en Dinax. Es un día libre.`;
          }
      }

      // 2. Build contextual prompt for the LLM
      const contextPrompt = `Contexto del Sistema Interno de Dinax:
Usuario vinculado: ${clientProfile.name || 'Alumno'}
Objetivo del cliente: ${clientProfile.objective || 'Mantenerse sano'}
Plan Principal: ${clientProfile.currentPlan || 'Sin plan'}
Estado hoy: ${todayWorkouts}

El alumno te dice: "${text}"

Responde como Dina basándote en esta info.`;

      // 3. Send to OpenRouter (Gemini / Llama)
      bot.telegram.sendChatAction(chatId, 'typing').catch(() => {});

      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash:free", 
        messages: [
          { role: "system", content: DINA_SYS_PROMPT },
          { role: "user", content: contextPrompt }
        ],
      });

      const reply = completion.choices[0]?.message?.content || "Emm... de momento me he quedado sin palabras 😅. Intenta decírmelo de otro modo.";

      // 4. Respond to Telegram
      await bot.telegram.sendMessage(chatId, reply);
      return respondOk("Replied via AI");
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return new Response("Webhook Error", { status: 500 });
  }
}
