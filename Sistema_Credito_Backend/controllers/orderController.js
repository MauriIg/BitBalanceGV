import { ESTADOS_ORDEN } from "../utils/estadosOrden.js";
import { asignarRapidito } from "../utils/asignarRapidito.js";
import { enviarCorreo } from "../utils/emailService.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Crear orden
export async function crearOrden(req, res) {
  try {
    const {
      productos,
      total,
      tipoEntrega,
      direccion,
      referencias,
      telefono,
      estado,
      metodoPago,
      comentarios
    } = req.body;

    let estadoInicial = estado;

    if (!estadoInicial) {
      if (req.usuario.rol === "cajero") {
        estadoInicial =
          metodoPago === "efectivo" || metodoPago === "transferencia"
            ? ESTADOS_ORDEN.COMPLETADA
            : ESTADOS_ORDEN.PAGADO;
      } else {
        if (tipoEntrega === "domicilio") {
          estadoInicial =
            metodoPago === "efectivo"
              ? ESTADOS_ORDEN.PENDIENTE_PAGO
              : ESTADOS_ORDEN.PAGADO;
        } else {
          estadoInicial = ESTADOS_ORDEN.PARA_RECOGER;
        }
      }
    }

    const rapiditoAsignado =
      tipoEntrega === "domicilio" ? await asignarRapidito() : null;

    const nuevaOrden = new Order({
      productos,
      total,
      usuario: req.usuario._id,
      tipoEntrega,
      direccion,
      referencias,
      telefono,
      metodoPago,
      comentarios,
      asignadoA: rapiditoAsignado,
      estado: estadoInicial,
      cashier: req.usuario.rol === "cajero" ? req.usuario._id : undefined
    });

    await nuevaOrden.save();

    console.log("📦 productos recibidos:");
    console.log(JSON.stringify(productos, null, 2));

    

    // 📧 Enviar correo
    if (rapiditoAsignado) {
      const rapidito = await User.findById(rapiditoAsignado);

      if (rapidito?.email) {
        try {
          await enviarCorreo(
            rapidito.email,
            "Nueva orden asignada",
            `<p>Hola <strong>${rapidito.nombre}</strong>,</p>
             <p>Se te ha asignado una nueva orden para entrega a domicilio.</p>
             <p>Ingresa a tu panel para ver los detalles.</p>
             <p>Gracias,<br><strong>Abarrotes San Roque</strong></p>`
          );
        } catch (error) {
          console.error("❌ Error al enviar correo:", error);
        }
      }
    }

    res.status(201).json({
      mensaje: "Orden creada exitosamente",
      orden: nuevaOrden
    });

  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ mensaje: "Error al crear la orden", error });
  }
}

// Marcar orden como entregada
export async function marcarOrdenComoEntregada(req, res) {
  try {
    const orden = await Order.findById(req.params.id);

    if (!orden) {
      return res.status(404).json({ mensaje: "Orden no encontrada" });
    }

    if (
      req.usuario.rol !== "rapidito" ||
      orden.asignadoA?.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    orden.estado = ESTADOS_ORDEN.COMPLETADA;
    await orden.save();

    res.json({ mensaje: "Orden completada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar orden" });
  }
}

// Finalizar orden (admin/cajero)
export async function marcarOrdenComoFinalizada(req, res) {
  try {
    const { estado } = req.body;
    const orden = await Order.findById(req.params.id);

    if (!orden) {
      return res.status(404).json({ mensaje: "Orden no encontrada" });
    }

    if (!["admin", "cajero"].includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    const permitidos = Object.values(ESTADOS_ORDEN);

    if (!estado || !permitidos.includes(estado)) {
      return res.status(400).json({ mensaje: "Estado inválido" });
    }

    orden.estado = estado;
    await orden.save();

    // ✅ SOLO STOCK AQUÍ (NO saldo otra vez)
    if (estado === ESTADOS_ORDEN.COMPLETADA) {
      for (const item of orden.productos) {
        const productoId =
          typeof item.producto === "string"
            ? item.producto
            : item.producto?._id;
      
        if (!productoId) continue;
      
        const abono = Number(item.abono) || 0;
      
        // 🔥 TRAER PRODUCTO
        const producto = await Product.findById(productoId);
        if (!producto) continue;
      
        // 🔥 DEFINIR saldoActual (AQUÍ estaba tu error)
        const saldoActual = Number(producto.saldoRestante) || 0;
      
        // 🔥 CALCULAR NUEVO SALDO
        const nuevoSaldo = Math.max(0, saldoActual - abono);
      
        // 🔥 ACTUALIZAR
        await Product.findByIdAndUpdate(productoId, {
          $inc: {
            precio: -(item.abono || 0), // 🔥 AQUÍ DESCUENTAS
            stock: -1
          }
        });
      
        // 🧪 DEBUG
        console.log("💰 saldo antes:", saldoActual);
        console.log("💸 abono:", abono);
        console.log("✅ saldo después:", nuevoSaldo);
      }
    }

    res.json({ mensaje: "Orden actualizada", orden });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al finalizar orden" });
  }
}

// Corte de caja
export async function cortarCaja(req, res) {
  try {
    if (req.usuario.rol !== "cajero") {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    await Order.updateMany(
      { cashier: req.usuario._id, corteCaja: false },
      { $set: { corteCaja: true } }
    );

    res.json({ mensaje: "Corte realizado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en corte de caja" });
  }
}

// Corte rapidito
export async function realizarCorteRapidito(req, res) {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const resultado = await Order.deleteMany({
      asignadoA: req.params.id,
      estado: ESTADOS_ORDEN.COMPLETADA
    });

    res.json({
      mensaje: `Se eliminaron ${resultado.deletedCount} órdenes finalizadas`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en corte rapidito" });
  }
}