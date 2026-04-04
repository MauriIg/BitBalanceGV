import "./ProductoDetalle.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductById } from "../services/productService";
import { useDispatch } from "react-redux";
import { agregarAlCarrito as agregarProductoAlCarrito } from "../redux/slices/carritoSlice";
import axiosInstance from "../services/axiosInstance";

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        const data = await fetchProductById(id);
        setProducto(data);
      } catch (err) {
        console.error("Error:", err);
        setError("No se pudo cargar el producto");
      }
    };

    obtenerProducto();
  }, [id]);

  const agregarAlCarrito = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (!userId) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    dispatch(agregarProductoAlCarrito({
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1,
    // 🔥 NUEVO
  esPago: true,
  semanaPagada: 1 // luego lo hacemos dinámico BITBALANCE
}));

navigate("/carrito"); // 👈 IMPORTANTE

    alert(`"${producto.nombre}" Redirigiendo a Registrar Pago`);
  };

  const volverAlCatalogo = () => {
    navigate("/catalogo");
  };

  const toggleFavorito = async () => {
    try {
      const res = await axiosInstance.put(`/api/products/${producto._id}/favorito`);
      setProducto({ ...producto, favorito: res.data.favorito });
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
      alert("No se pudo actualizar el estado de favorito.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!producto) return <p>Cargando...</p>;

  return (
    <div className="form-container">
    <div className="producto-detalle">
      <h2>{producto.nombre}</h2>
      <img src={producto.imagen} alt={producto.nombre} />
      <div className="info">
      <p><strong>Dia de Pago:</strong> {producto.diaPago || "N/A"}</p>
      <p><strong>Edad:</strong> {producto.edad || "No se agrego edad"}</p>
<p><strong>Estado Civil:</strong> {producto.estadoCivil || "N/A"}</p>
        <p><strong>Barrio/ Colonia</strong> {producto.categoria?.nombre || "(Sin Barr/Col)"}</p>
        <p><strong>Dirección :</strong> {producto.codigos || "N/A"}</p>
        <p><strong>Ocupación:</strong> {producto.ocupacion || "N/A"}</p>

<p><strong>Tiempo viviendo:</strong> {producto.tiempoViviendo || "N/A"}</p>

<p><strong>Tipo de vivienda:</strong> {producto.tipoVivienda || "N/A"}</p>

<p>
  <strong>Ubicación:</strong>{" "}
  {producto.ubicacionGPS ? (
    <a
      href={producto.ubicacionGPS}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ver en Google Maps 📍
    </a>
  ) : (
    "Sin ubicación"
  )}
</p>

<p><strong>Monto Solicitado sin interes:</strong> {producto.montoSolicitado}</p>
        <p><strong>Semanas:</strong> {producto.stock}</p>
        <p><strong>Pago semanal:</strong> ${producto.pagoSemanal?.toFixed(2)}</p>
        <p>
  <strong>Saldo restante:</strong> ${producto.precio}
</p>
        <p>
  <strong>Documentación:</strong>{" "}
  {producto.documentacion ? (
    <a
      href={producto.documentacion}
      target="_blank"
      rel="noopener noreferrer"
    >
      Da click aqui para ingresar 📄
    </a>
  ) : (
    "Sin documento"
  )}
</p>
<h3>Referencias</h3>

{producto.referencias && producto.referencias.length > 0 ? (
  <ul>
    {producto.referencias.map((ref, index) => (
      <li key={index} style={{ marginBottom: "10px" }}>
        <strong>Nombre:</strong> {ref.nombre} <br />
        <strong>Teléfono:</strong> {ref.telefono} <br />
        <strong>Parentesco:</strong> {ref.parentesco}
      </li>
    ))}
  </ul>
) : (
  <p>Sin referencias</p>
)}
        
        <p>
          <strong>Pagador:</strong>{" "}
          <button
            onClick={toggleFavorito}
            style={{ fontSize: "16px", cursor: "pointer", border: "none", background: "transparent" }}
          >
            {producto.favorito ? " Pagador Puntual" : "☆ No puntual"}
          </button>
        </p>
        
      </div>

      <div className="acciones">
        <button className="btn volver" onClick={volverAlCatalogo}>
          ⬅ Volver al catálogo
        </button>
        <button className="btn carrito" onClick={agregarAlCarrito}>
        💳💲 Registrar Pago
        </button>
      </div>
    </div>
    </div>
  );
};

export default ProductoDetalle;
