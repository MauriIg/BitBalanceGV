import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../redux/slices/productSlice";
import { logout } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import logo from "../assets/logo.jpeg";

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.product);
  const usuario = useSelector((state) => state.auth.user);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await axiosInstance.delete(`/api/products/${id}`);
        dispatch(getProducts());
      } catch (error) {
        console.error(error);
        alert("Error al eliminar producto");
      }
    }
  };

  const alternarVisible = async (id, visible) => {
    try {
      await axiosInstance.put(`/api/products/${id}`, { visible: !visible });
      dispatch(getProducts());
    } catch (error) {
      console.error(error);
      alert("Error al actualizar visibilidad");
    }
  };

  const alternarFavorito = async (id) => {
    try {
      await axiosInstance.put(`/api/products/${id}/favorito`);
      dispatch(getProducts());
    } catch (error) {
      console.error(error);
      alert("Error al actualizar favorito");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const productosFiltrados = products.filter((p) => {
    const texto = busqueda.toLowerCase();
  
    return (
      p.nombre.toLowerCase().includes(texto) ||
      (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(texto)) ||
      (p.diaPago && p.diaPago.toLowerCase().includes(texto))
    );
  });

  const aplicarInteresDeuda = async (p) => {
    const porcentaje = prompt("¿Qué Porcentaje de interés desea aplicar?");
  
    if (!porcentaje) return;
  
    const interes = parseFloat(porcentaje);
  
    if (isNaN(interes)) {
      alert("Número inválido");
      return;
    }
  
    // 🔥 CALCULO CLAVE
    const deudaRestante = p.precio * p.stock;
    const montoInteres = deudaRestante * (interes / 100);
  
    // 👉 puedes decidir cómo guardarlo:
    const nuevaDeuda = deudaRestante + montoInteres;
  
    // 👉 convertirlo otra vez a precio por semana
    const nuevoPrecio = parseFloat((nuevaDeuda / p.stock).toFixed(1));

    
  
    try {
      await axiosInstance.put(`/api/products/${p._id}`, {
        precio: nuevoPrecio
      });
  
      dispatch(getProducts());
    } catch (error) {
      console.error(error);
      alert("Error al aplicar interés");
    }

    
  };


  const cambiarColor = async (id, color) => {
    try {
      await axiosInstance.put(`/api/products/${id}`, {
        estadoColor: color
      });
  
      dispatch(getProducts());
    } catch (error) {
      console.error(error);
      alert("Error al cambiar estado");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "20px",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ccc",
          padding: "12px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <img src={logo} alt="Logo" style={{ height: "180px", marginInlineEnd:"80px"}} />
          <div>
            <strong>Bienvenido Administrador:</strong>{" "}
            {usuario.nombre || usuario.email}
          </div>
      
        </div>
      </div>

      <h1>Lista de Clientes</h1>

      <div style={{ marginBottom: "20px" }}>
      <button onClick={() => navigate("/Catalogo")} style={{ marginRight: "10px" }}>
          Catálogo de Clientes
        </button>
        <button onClick={() => navigate("/add-product")} style={{ marginRight: "10px" }}>
          ➕ Registrar Cliente
        </button>
        <button onClick={() => navigate("/categorias")} style={{ marginRight: "10px" }}>
          Barrios/Colonias
        </button>
        <button onClick={() => navigate("/admin/ordenes")} style={{ marginRight: "10px" }}>
          Historial de Pagos
        </button>
        
        <button onClick={() => navigate("/asignar-rapiditos")} style={{ marginRight: "10px" }}>
          Panel Cobradores
        </button>
        <button onClick={() => navigate("/bajo-stock")} style={{ marginRight: "10px" }}>
          Por líquidar
        </button>
        <button onClick={() => navigate("/carrito")} style={{ marginRight: "10px" }}>
          Registro de pago pendiente
        </button>

        <button onClick={() => navigate("/estadisticas")}>
  📊 Estadísticas
</button>
<button onClick={() => navigate("/register")} style={{ marginRight: "10px" }}>
          Add Nvo Admin
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "#c0392b",
            color: "white",
            padding: "8px 12px",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente por nombre, barr o dia de cobro..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Barrio/Colonia</th>
            <th>Telefono</th>
            
            <th>Monto</th>
            <th>Semanas pendientes</th>
            <th>Visible</th>
            <th>Pagador</th>
            <th>Acciones</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((p) => (
            <tr
            key={p._id}
            style={{
              borderBottom: "1px solid #ccc",
              backgroundColor:
                p.estadoColor === "verde" ? "#d4edda" :
                p.estadoColor === "amarillo" ? "#fff3cd" :
                p.estadoColor === "naranja" ? "#ffe5b4" :
                p.estadoColor === "rojo" ? "#f8d7da" :
                p.visible ? "white" : "#eee"
            }}
          >
              <td>{p.nombre}</td>
              <td>{p.categoria?.nombre || "Sin categoría"}</td>
              <td>{p.telefono}</td>
              
              <td>${p.precio}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => alternarVisible(p._id, p.visible)}>
                  {p.visible ? "✅" : "❌"}
                </button>
              </td>
              <td>
                <button onClick={() => alternarFavorito(p._id)}>
                  {p.favorito ? "⭐" : "☆"}
                </button>
              </td>
              <td>
                
                <button onClick={() => navigate(`/producto/${p._id}`)}>
                  Inf
                </button>
                <button onClick={() => aplicarInteresDeuda(p)}>
  💸+
</button>
<button onClick={() => navigate(`/edit-product/${p._id}`)}>✏️</button>
<button onClick={() => eliminarProducto(p._id)}>🗑️</button>


     </td>

     <td>
  <select
    value={p.estadoColor || ""}
    onChange={(e) => cambiarColor(p._id, e.target.value)}
    style={{
      padding: "5px",
      borderRadius: "5px"
    }}
  >
    <option value="">⚪ Al corriente</option>
    <option value="verde">🟢 Contrato líquidado</option>
    <option value="amarillo">🟡 Retraso leve</option>
    <option value="naranja">🟠 Atrasado</option>
    <option value="rojo">🔴 Moroso</option>
  </select>
</td>



            </tr>

        
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
