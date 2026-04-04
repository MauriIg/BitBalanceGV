// src/pages/Carrito.jsx
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  quitarDelCarrito,
  cambiarCantidad,
  vaciarCarrito,
  cargarCarrito
} from "../redux/slices/carritoSlice";
import { crearOrden } from "../services/orderService";
import { obtenerCarritoUsuario } from "../services/carritoService";
import axiosInstance from "../services/axiosInstance";
import { ESTADOS_ORDEN } from "../constants/orderEstados";

const Carrito = () => {
  const carrito = useSelector(state => state.carrito);
  const usuario = useSelector(state => state.auth?.user);
  const token = usuario?.token;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [tipoEntrega, setTipoEntrega] = useState("tienda");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [direccion, setDireccion] = useState("");
  const [referencias, setReferencias] = useState("");
  const [telefono, setTelefono] = useState("");
  const [comentarios, setComentarios] = useState("");

  //CAMBIO DE BITBALANCE
  const total = carrito.reduce((acc, item) => {
    const abonado = item.cantidad || 0;
    return acc + abonado;
  }, 0);

  useEffect(() => {
    const fetchCarrito = async () => {
      if (!token) return;
      try {
        const carritoGuardado = await obtenerCarritoUsuario(token);
        if (carritoGuardado && carritoGuardado.productos) {
          dispatch(cargarCarrito(carritoGuardado.productos));
        }
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
      }
    };

    fetchCarrito();
  }, [token, dispatch]);

  const handleFinalizarCompra = async () => {
    if (!usuario) {
      alert("Inicia sesión para finalizar la compra");
      return navigate("/login");
    }

    const productosFormateados = carrito
      .filter(p => p._id)
      .map(p => ({
        producto: p._id,
        abono: p.cantidad, //CAMBIO SOLO SE CORTO LA LINEA PROXIMA
        
      }));

    let estadoInicial;

    if (tipoEntrega === "tienda") {
      if (metodoPago === "tarjeta") {
        estadoInicial = ESTADOS_ORDEN.PAGADO;
      } else {
        estadoInicial = ESTADOS_ORDEN.PENDIENTE_RECOGER;
      }
    } else if (tipoEntrega === "domicilio") {
      if (metodoPago === "tarjeta") {
        estadoInicial = ESTADOS_ORDEN.PAGADO;
      } else {
        estadoInicial = ESTADOS_ORDEN.PENDIENTE_PAGO;
      }
    }

    if (tipoEntrega === "domicilio") {
      if (!direccion || !telefono) {
        return alert("Debes completar la dirección y el teléfono para la entrega a domicilio.");
      }
    }

    try {
      await crearOrden(
        {
          productos: productosFormateados,
          total,
          tipoEntrega,
          direccion: tipoEntrega === "domicilio" ? direccion : "",
          referencias: tipoEntrega === "domicilio" ? referencias : "",
          telefono: tipoEntrega === "domicilio" ? telefono : "",
          metodoPago,
          estado: estadoInicial,
          comentarios,
        },
        token
      );

      

      dispatch(vaciarCarrito());
      alert("¡Pago Realizado con Exito!");
      navigate("/products");
    } catch (error) {
      console.error(error);
      alert("Error al realizar el registro");
    }
  };

  const handleStripeCheckout = async () => {
    if (!usuario || !usuario._id) {
      alert("Debes iniciar sesión para pagar con tarjeta.");
      return navigate("/login");
    }

    try {
      const res = await axiosInstance.post(
        "/api/payment/create-checkout-session",
        {
          cartItems: carrito.map(p => ({
            productoId: p._id,
            nombre: p.nombre,
            precio: p.precio,
            quantity: p.cantidad,
          })),
          usuarioId: usuario._id,
          tipoEntrega,
          direccion: tipoEntrega === "domicilio" ? direccion : "",
          referencias: tipoEntrega === "domicilio" ? referencias : "",
          telefono: tipoEntrega === "domicilio" ? telefono : "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.href = res.data.url;
    } catch (err) {
      console.error("Error al redirigir a Stripe:", err);
      alert("Hubo un error al iniciar el pago.");
    }
  };
  

  return (
    <div>
      <h2>Registro de Pago Semanal</h2>
      {carrito.length === 0 ? (
        <p>La solicitud está vacía</p>
      ) : (
        <>
          {carrito.map(item => {
            const producto = item.producto || item;
            const precio = producto.precio || item.precio || 0;
            const nombre = producto.nombre || item.nombre || "Sin nombre";
            const imagen = producto.imagen || "";

            return (
              <div key={producto._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                {imagen && (
                  <img
                    src={imagen}
                    alt={nombre}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                )}
                <h4>{nombre}</h4>
                
                <p>Deuda total: ${precio}</p>

<p>
  Abono:{" "}
  <input
    type="number"
    value={item.cantidad}
    onChange={e =>
      dispatch(
        cambiarCantidad({
          id: producto._id,
          cantidad: Number(e.target.value),
        })
      )
    }
  />
</p>


                <button onClick={() => dispatch(quitarDelCarrito(producto._id))}>
                  Eliminar
                </button>
              </div>
            );
          })}

          <div>
            <h4>Dirección de cobro</h4>
            <select value={tipoEntrega} onChange={(e) => setTipoEntrega(e.target.value)}>
              <option value="tienda">Domicilio Fijado</option>
              <option value="domicilio">Otra dirección</option>
            </select>

            {tipoEntrega === "domicilio" && (
              <>
                <input
                  type="text"
                  placeholder="Dirección de cobro"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Referencias (opcional)"
                  value={referencias}
                  onChange={(e) => setReferencias(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Motivo"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </>
            )}
          </div>

          <div>
            <h4>Método de pago</h4>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              
            </select>
          </div>

          <textarea
  placeholder="Agregar comentarios (ej: Observaciones, complicaciones, sugerencias, queja...)"
  value={comentarios}
  onChange={(e) => setComentarios(e.target.value)}
  style={{
    width: "100%",
    maxWidth: "400px",
    height: "80px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: "10px"
  }}
/>

          <h3>Se realizó un abono de : ${total.toFixed(2)}</h3>
          <button onClick={() => dispatch(vaciarCarrito())}>Limpiar Solicitud</button>
          <br /><br />
          {metodoPago !== "tarjeta" && (
            <button onClick={handleFinalizarCompra}>Registrar Pago</button>
          )}
          {metodoPago === "tarjeta" && (
            <button onClick={handleStripeCheckout}>ATAJO NO ESTABLECIDO</button>
          )}
        </>
      )}
    </div>
  );
};

export default Carrito;
