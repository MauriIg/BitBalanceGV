import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../services/axiosInstance";

// 📊 Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Estadisticas = () => {
  const { products } = useSelector((state) => state.product);

  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true); // 🔥 mejor que ready

  useEffect(() => {
    const obtenerOrdenes = async () => {
      try {
        const res = await axiosInstance.get("/api/orders");
        setOrdenes(res.data || []);
      } catch (error) {
        console.error("Error al obtener órdenes:", error);
        setOrdenes([]);
      } finally {
        setLoading(false);
      }
    };

    obtenerOrdenes();
  }, []);

  // 🔥 PROTECCIÓN products
  const listaProductos = Array.isArray(products) ? products : [];

  // 💰 INVERSIÓN REAL
  const inversionInicial = listaProductos.reduce((acc, p) => {
    return acc + Number(p.montoSolicitado || 0);
  }, 0);

  // 📈 TOTAL DEUDA
  const deudaTotal = listaProductos.reduce((acc, p) => {
    return acc + Number(p.precio || 0);
  }, 0);

  // 💵 RECAUDADO
  const totalRecaudado = ordenes.reduce((acc, o) => {
    return acc + Number(o.total || 0);
  }, 0);

  // 💸 RESTANTE
  const restanteReal = Math.max(0, deudaTotal - totalRecaudado);

  // 🔥 GANANCIAS
  const gananciaActual = totalRecaudado - inversionInicial;
  const gananciaTotal = deudaTotal - inversionInicial;

  // 📊 DATA SEGURA
  const data = [
    { name: "Recaudado", value: totalRecaudado || 0 },
    { name: "Pendiente", value: restanteReal || 0 },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  // 🔥 LOADING REAL
  if (loading) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Estadísticas Financieras putito</h1>

      {/* CARDS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>💰 Inversión</h3>
          <p>${inversionInicial.toFixed(2)}</p>
        </div>

        <div style={cardStyle}>
          <h3>💵 Recaudado</h3>
          <p>${totalRecaudado.toFixed(2)}</p>
        </div>

        <div style={cardStyle}>
          <h3>💰 Total cartera</h3>
          <p>${deudaTotal.toFixed(2)}</p>
        </div>

        <div style={cardStyle}>
          <h3>🔥 Ganancia Actual</h3>
          <p
            style={{
              color: gananciaActual >= 0 ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            ${gananciaActual.toFixed(2)}
          </p>
        </div>

        <div style={cardStyle}>
          <h3>🔥 Ganancia Total p</h3>
          <p
            style={{
              color: gananciaTotal >= 0 ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            ${gananciaTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* GRÁFICA */}
      <div
        style={{
          width: "100%",
          height: "400px", // 🔥 CLAVE
        }}
      >
        <h2>📊 Distribución real</h2>

        {data.every((d) => d.value === 0) ? (
          <p>No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

// 🎨 estilo
const cardStyle = {
  flex: "1",
  minWidth: "200px",
  background: "#f8f9fa",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  textAlign: "center",
};

export default Estadisticas;