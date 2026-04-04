import { useEffect, useState } from "react";
import { fetchVisibleProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";
import "./Catalogo.css";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchVisibleProducts();
        setProductos(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar productos.");
      }
    };
    cargar();
  }, []);

  // Obtener categorías únicas
  const categoriasUnicas = Array.from(
    new Map(
      productos
        .filter(p => p.categoria && p.categoria._id)
        .map(p => [p.categoria._id, p.categoria])
    ).values()
  );

  // Función de filtrado inteligente
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaSeleccionada ? p.categoria?._id === categoriaSeleccionada : true;

    const textoBusqueda = busqueda.toLowerCase();
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(textoBusqueda) ||
      (p.codigo && p.codigo.toLowerCase().includes(textoBusqueda)) ||
      (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(textoBusqueda)) ||
      (p.diaPago && (
        p.diaPago.toLowerCase().includes(textoBusqueda) ||
        p.diaPago.toLowerCase() === textoBusqueda
      ))
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="catalogo-container">
      <h2>Catálogo</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Barra de búsqueda */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar cliente por nombre, dirección, barr o dia de cobro..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "10px"
          }}
        />
      </div>

      {/* Filtro de categorías */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Categorías:</h4>
        {categoriasUnicas.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setCategoriaSeleccionada(cat._id)}
            style={{
              marginRight: "10px",
              padding: "8px 12px",
              background: categoriaSeleccionada === cat._id ? "#3498db" : "#ccc",
              color: categoriaSeleccionada === cat._id ? "white" : "black",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {cat.nombre}
          </button>
        ))}

        {categoriaSeleccionada && (
          <button
            onClick={() => setCategoriaSeleccionada("")}
            style={{
              marginLeft: "20px",
              padding: "8px 12px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Productos */}
      <div>
        {productosFiltrados.length === 0 ? (
          <p>No hay clientes que coincidan con tu búsqueda.</p>
        ) : (
          <div className="productos-grid">
            {productosFiltrados.map((p) => (
              <div key={p._id} className="producto-card">
                {p.imagen && <img src={p.imagen} alt={p.nombre} />}
                <h4>{p.nombre}</h4>
                <p><strong>Dia de Cobro:</strong> {p.diaPago}</p>
                <p><strong>Barrio/Colonia:</strong> {p.categoria?.nombre || "Sin categoría"}</p>
                <p><strong>Monto:</strong> ${p.precio}</p>
                <p><strong>Dirección:</strong> {p.codigos}</p>
                <button onClick={() => navigate(`/producto/${p._id}`)}>
                  Ver más
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
