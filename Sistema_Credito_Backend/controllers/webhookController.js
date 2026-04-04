// controllers/webhookController.js
import Stripe from "stripe";
import Order from "../models/Order.js";
import { asignarRapidito } from "../utils/asignarRapidito.js";
import { ESTADOS_ORDEN } from "../utils/estadosOrden.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const stripeWebhook = async (req, res) => {
  console.log("🔔 Request recibido en /api/webhook");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Webhook recibido:", event.type);
  } catch (err) {
    console.error("❌ Error validando firma del webhook:");
    console.error("Encabezado recibido:", sig);
    console.error("Mensaje de error:", err.message);
    console.log("📦 Cuerpo recibido sin validar:", req.body);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Evento de pago completado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    console.log("🧾 Metadata recibida:", session.metadata);

    if (!orderId) {
      console.error("❌ No se recibió orderId en la metadata");
      return res.status(400).json({ mensaje: "Falta orderId en metadata" });
    }

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        console.error(`❌ Orden con ID ${orderId} no encontrada`);
        return res.status(404).json({ mensaje: "Orden no encontrada" });
      }

      // Asignar rapidito si es entrega a domicilio
      if (order.tipoEntrega === "domicilio") {
        const deliveryGuy = await asignarRapidito();
        order.asignadoA = deliveryGuy;
        order.estado = ESTADOS_ORDEN.PAGADO;
        console.log(`🚴 Rapidito asignado: ${deliveryGuy}`);
      } else {
        order.estado = ESTADOS_ORDEN.PARA_RECOGER;
        console.log("🛍️ Orden marcada como 'pendiente para recoger'");
      }

      order.total = session.amount_total / 100;
      await order.save();

      console.log(`✅ Orden ${orderId} actualizada con éxito`);
    } catch (error) {
      console.error("❌ Error al actualizar la orden:", error);
      return res.status(500).json({ mensaje: "Error al actualizar orden", error });
    }
  }

  // ⚠️ Evento de expiración
  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        estado: ESTADOS_ORDEN.CANCELADA
      });
      console.log(`⚠️ Orden ${orderId} marcada como cancelada por expiración`);
    }
  }

  // ✅ Confirmar recepción
  res.status(200).send("Evento recibido");
};