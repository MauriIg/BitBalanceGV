// utils/emailService.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Asegura que las variables del .env estén disponibles

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM, // ✅ Debe coincidir con tu .env
    pass: process.env.EMAIL_PASS,
  },
});


// Función para enviar correos
export const enviarCorreo = async (para, asunto, mensajeHTML) => {
  const mailOptions = {
    from: `"Abarrotes San Roque" <${process.env.EMAIL_FROM}>`,
    to: para,
    subject: asunto,
    html: mensajeHTML,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📨 Correo enviado a:", para);
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
  }
};
