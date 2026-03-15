# Plan de Integración Profundo: Bot Dina + IA en Vercel

Has tocado puntos clave de seguridad, reducción de costos operativos y enganche "push" con los alumnos ("retention"). Me parece genial. Responder con un agente pasivo no es suficiente, necesitamos que "Dina" tenga voz propia y empuje a la gente.

Aquí detallo cómo solventamos y construimos sobre tus nuevos requerimientos.

---

## 1. Validación de Usuarios y Privacidad de App (El "Linking")

Para asegurarnos de que solo los usuarios de Dinax hablen con Dina, y para garantizar que Dina _solamente_ acceda a la información propia del alumno y su tenant sin romper la privacidad o las reglas de base de datos actuales:

**Flujo Propuesto:**
1.  **En la App (Sección Perfil):** Añadiremos un botón que diga "Conectar con Telegram".
2.  **Código Seguro:** Al pulsarlo, el sistema genera de forma segura un código temporal en la base de datos vinculado exclusivamente a ese usuario (Ej: `DINA-XYZ89`).
3.  **Chat en Telegram:** El alumno va al bot oficial de Dina y envía el comando que se le indica en la web: `/start DINA-XYZ89`.
4.  **Confirmación Backend:** El webhook de Vercel recibe este mensaje, busca ese código temporal en la base de datos en modo administrador (Firebase Admin SDK), verifica de qué usuario es, y _empareja_ guardando el `telegramChatId` numérico del usuario de forma permanente en su perfil de `user_profile`.
5.  **Aislamiento:** De allí en adelante, cualquier consulta de ese chat ID siempre usará el _Firebase Admin SDK_ desde Vercel (ya que no es un cliente, es el backend que procesa el Webhook interno), pero en nuestra consulta forzaremos a que la IA **solo** tome datos pasándole el `clientId` y el `tenantId` correspondientes a ese usuario de Telegram. Nadie más verá nada distinto a lo suyo.

---

## 2. Cerebro Gratuito para Desarrollo: OpenRouter

Para la etapa de desarrollo y para mantener costos en cero, OpenRouter es la solución indiscutida. Actúa como un proxy de modelos, así que usamos la misma librería que ya instalamos (`openai`), solo cambiamos la URL base a la que apunta y la llave.

**Opciones de Modelos Gratuitos (OpenRouter):**
*   **`google/gemini-2.5-flash:free`:** (Recomendado). Muy rápido, gratuito y con razonamiento lógico sobresaliente para un agente conversacional contextual de deportes.
*   **`meta-llama/llama-3-8b-instruct:free`:** Modelo gratuito de Meta. Excelente para conversaciones naturales, muy empático para el rol de coach. 

Configuraremos nuestra variable de entorno `OPENROUTER_API_KEY` y el cliente de OpenAI llamará a una de estas alternativas sin cobrarte un centavo.

---

## 3. Identidad de Agente DINA 🤖👟

Dina no es un robot estándar. Cuando le enviemos el contexto al LLM oculto desde nuestro Webhook, le daremos un "System Prompt" que condicionará toda su existencia:

> *"Actúas como Dina, una asistente y coach deportiva experta en fisiología del ejercicio de la app Dinax. Tu tono es entusiasta, empático y orientado a motivar al alumno. Hablas de forma concisa. Tratas de animar al usuario si está cansado, o de retarlo sanamente si lo ves motivado. Ayudas a reprogramar sesiones y das visibilidad del plan de hoy explicando rápidamente para qué sirve. Nunca pareces un robot, usas emojis naturales y un trato de compañera de equipo."*

---

## 4. Retención y Comunicación Proactiva (Push)

Si Dina espera a que le hablen, poca gente la usará luego del primer mes. Necesita ser proactiva.
Para enviar recordatorios como un reloj sin levantar un servidor "always on", combinaremos Telegram y **Vercel Cron Jobs**. Con Vercel, tienes alertas cron gratuitas diarias en el plan Hobby.

**Arquitectura de Avisos:**
1.  **Configuración `vercel.json`:** Le diremos a Vercel que despierte su reloj interno todos los días a una hora específica (ej. 8:00 AM).
2.  **El Endpoint Controlador (`/api/telegram/cron/route.ts`):** Vercel llamará automáticamente a este endpoint interno todos los días en ese horario.
3.  **Procesamiento Inteligente:** El código leerá a todos los clientes que tengan un `telegramChatId` guardado.
    *   Buscará los "Events" (entrenamientos) en la base de datos de cada uno dentro de las próximas 24 hs usando Firebase Admin.
    *   Si tienen una sesión, llamará a la IA de OpenRouter pidiéndole: *"El usuario [Nombre], tiene una sesión de [Nombre_Plan] mañana. Envíale un mensaje de 2 líneas motivándolo como Dina"*. 
    *   La API tomará ese texto generado y se lo enviará por push a su Telegram usando `telegraf.telegram.sendMessage(chatId, textoDina)`.
    *   Si llevan mucho sin registrar actividad, Dina puede usar otro prompt de reactivación.

## 🔒 Variables de Entorno y Configuración (Listas para Desarrollo)

El usuario ya ha provisto todas las llaves necesarias. Para el desarrollo e implementación, se utilizarán las siguientes variables:

*   **URL Base del Webhook:** `https://dinaxapp.vercel.app/api/telegram`
*   `TELEGRAM_BOT_TOKEN="8729824902:AAHAxSD49uGe_QwuZgGfiokq4xB24gYx1WI"` (Dina @DinaxArg_bot)
*   `OPENROUTER_API_KEY="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"`
*   *(Las credenciales de Firebase Admin ya están funcionales en `.env.local`)*

## 🏁 Estado Actual
El plan está diseñado, validado y las llaves maestras han sido otorgadas. A partir de la próxima sesión de trabajo, comenzará la escritura del código (Webhook, Linking UI, y Cron).
