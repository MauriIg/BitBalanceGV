import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useSelector } from "react-redux";
import { ESTADOS_ORDEN } from "../constants/orderEstados";

const AdminOrdenes = () => {
  const usuario = useSelector((state) => state.auth.user);
  const token = usuario?.token;

  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const res = await axiosInstance.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordenadas = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrdenes(ordenadas);
      } catch (err) {
        console.error("Error al cargar órdenes", err);
      }
    };

    if (usuario?.rol === "admin") cargarOrdenes();
  }, [token, usuario]);

  const eliminarOrden = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta orden?")) return;

    try {
      await axiosInstance.delete(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdenes((prev) => prev.filter((orden) => orden._id !== id));
    } catch (err) {
      console.error("Error al eliminar orden", err);
    }
  };

  const marcarComoFinalizado = async (id) => {
    try {
      await axiosInstance.put(
        `/api/orders/${id}/estado`,
        {
          estado: ESTADOS_ORDEN.COMPLETADA,
        },
        {
          headers: {
            Authorization: `Bearer ${usuario.token}`,
          },
        }
      );
  
      // 🔥 VOLVER A TRAER ÓRDENES ACTUALIZADAS
      const res = await axiosInstance.get("/api/orders", {
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
  
      const ordenadas = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  
      setOrdenes(ordenadas);
  
    } catch (error) {
      console.error("Error al finalizar la orden:", error);
    }
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case ESTADOS_ORDEN.PENDIENTE_PAGO:
        return "#d35400"; // naranja oscuro
      case ESTADOS_ORDEN.PARA_RECOGER:
        return "#f39c12"; // naranja
      case ESTADOS_ORDEN.PAGADO:
      case ESTADOS_ORDEN.EN_CAMINO:
        return "#2980b9"; // azul
      case ESTADOS_ORDEN.COMPLETADA:
        return "#27ae60"; // verde
      case ESTADOS_ORDEN.CANCELADA:
        return "#c0392b"; // rojo
      default:
        return "#7f8c8d"; // gris
    }
  };

  const estadoLegible = {
    [ESTADOS_ORDEN.PENDIENTE]: "Pendiente",
    [ESTADOS_ORDEN.PENDIENTE_PAGO]: "cobro en curso",
    [ESTADOS_ORDEN.PARA_RECOGER]: "Pendiente por confirmar pago",
    [ESTADOS_ORDEN.PAGADO]: "Pagado",
    [ESTADOS_ORDEN.EN_CAMINO]: "En camino",
    [ESTADOS_ORDEN.COMPLETADA]: "Completada",
    [ESTADOS_ORDEN.CANCELADA]: "Cancelada",
  };

  const ordenesFiltradas = ordenes.filter((orden) => {
    // 🔥 FILTRO POR PRODUCTO (PRIMERO)
    if (filtro === "producto") {
      const texto = busqueda.toLowerCase().trim();
  
      if (!texto) return true;
  
      return orden.productos.some((p) => {
        const nombre = p.producto?.nombre || "";
        return nombre.toLowerCase().includes(texto);
      });
    }
  
    // 🔹 FILTRO NORMAL (estado)
    let coincideEstado = true;
  
    if (filtro !== "todos") {
      if (filtro === "cajero") {
        coincideEstado = orden.estado === ESTADOS_ORDEN.PARA_RECOGER;
      } else if (filtro === "rapidito") {
        coincideEstado = orden.estado === ESTADOS_ORDEN.PENDIENTE;
      } else if (filtro === ESTADOS_ORDEN.PENDIENTE_PAGO) {
        coincideEstado = orden.estado === ESTADOS_ORDEN.PENDIENTE_PAGO;
      } else {
        coincideEstado = orden.usuario?.rol === filtro;
      }
    }
  
    return coincideEstado;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Panel de Administración - Historial de pagos</h1>

      <label htmlFor="filtro">Filtrar por estado / Cliente o Completado:</label>
      <select
        id="filtro"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{ marginBottom: "15px", padding: "5px", marginLeft: "10px" }}
      >
        <option value="todos">Todos</option>
        <option value="producto">Cliente</option>
        <option value="rapidito">Cobro en curso</option>
        <option value="cajero">Pendiente por confirmar pago</option>
        <option value={ESTADOS_ORDEN.PENDIENTE_PAGO}>Pendiente Pago</option>
      </select>

      {filtro === "producto" && (
  <input
    type="text"
    placeholder="Escribe el nombre del producto..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    style={{ marginLeft: "10px", padding: "5px" }}
  />
)}

      {ordenesFiltradas.length === 0 ? (
        <p>No hay órdenes para mostrar.</p>
      ) : (
        ordenesFiltradas.map((orden) => (
          <div
            key={orden._id}
            style={{
              border: "1px solid #ccc",
              margin: "15px 0",
              padding: "15px",
              borderLeft: `6px solid ${colorEstado(orden.estado)}`,
              borderRadius: "5px",
              backgroundColor: "#fdfdfd",
            }}
          >
            <p>
              <strong>👤 Admin que registro el pago:</strong> {orden.usuario?.nombre || "Desconocido"} ({orden.usuario?.rol})
            </p>
            <p><strong>📅 Fecha:</strong> {new Date(orden.createdAt).toLocaleString()}</p>
            <strong>💰 Abono realizado:</strong> ${orden.total.toFixed(2)}
            <p>
  <strong>🚚 Lugar de pago:</strong>{" "}
  {orden.tipoEntrega === "tienda"
    ? "Domicilio Fijado"
    : orden.tipoEntrega === "domicilio"
    ? "Otra dirección"
    : orden.tipoEntrega || "No especificado"}

{orden.tipoEntrega === "domicilio" && (
  <div style={{ marginTop: "10px" }}>
    <p><strong>📍 Dirección de cobro:</strong> {orden.direccion || "No especificada"}</p>
    <p><strong>🧭 Referencias:</strong> {orden.referencias || "N/A"}</p>
    <p><strong>🔎 Motivo:</strong> {orden.telefono || "No proporcionado"}</p>
  </div>
)}
</p>
            <p><strong>💳 Método de pago:</strong> {orden.metodoPago || "Efectivo"}</p>
            <p>
              <strong>📌 Estado:</strong>{" "}
              <span style={{ color: colorEstado(orden.estado), fontWeight: "bold" }}>
                {estadoLegible[orden.estado] || orden.estado}
              </span>
            </p>
            <p><strong>🧾 Cliente y aclaraciones:</strong></p>
            <ul style={{ paddingLeft: "20px" }}>
            {orden.productos.map((p, i) => (
  <li key={i}>
    {p.producto?.nombre || "Cliente"}  
    
  </li>
))}
            </ul>

            {orden.comentarios && (
  <p>
    <strong>📝 Comentarios:</strong> {orden.comentarios}
  </p>
)}

            <button
              onClick={() => eliminarOrden(orden._id)}
              style={{
                background: "#e74c3c",
                color: "white",
                padding: "6px 12px",
                marginTop: "10px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🗑️ Eliminar Registro
            </button>
            <button onClick={() => marcarComoFinalizado(orden._id)}>Marcar como Completada</button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrdenes;
