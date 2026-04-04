import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../services/axiosInstance";
import { useMemo } from "react";

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

  useEffect(() => {
    const obtenerOrdenes = async () => {
      try {
        const res = await axiosInstance.get("/api/orders");
        setOrdenes(res.data);
      } catch (error) {
        console.error("Error al obtener órdenes:", error);
      }
    };

    obtenerOrdenes();
  }, []);

  // 💰 INVERSIÓN REAL (lo que prestaste)
  const inversionInicial = products.reduce((acc, p) => {
    return acc + (p.montoSolicitado || 0);
  }, 0);

  // 📈 TOTAL DEUDA (con interés actual)
  const deudaTotal = products.reduce((acc, p) => {
    return acc + (p.precio || 0);
  }, 0);

  // 💵 RECAUDADO (pagos reales)
  const totalRecaudado = useMemo(() => {
    return ordenes.reduce((acc, o) => acc + Number(o.total || 0), 0);
  }, [ordenes]);

  // 💸 LO QUE FALTA
  const restanteReal = deudaTotal;

  // 🔥 GANANCIA actual
  const gananciaActual = totalRecaudado - inversionInicial;

  // 🔥 GANANCIA total
  const gananciaTotal = (deudaTotal + totalRecaudado) - inversionInicial;

  // 📊 DATA PARA GRÁFICA
  const data = [
    { name: "Recaudado", value: totalRecaudado },
    { name: "Pendiente", value: restanteReal > 0 ? restanteReal : 0 },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Estadísticas Financieras</h1>

      {/* CARDS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>💰 Inversión</h3>
          <p>${inversionInicial.toFixed(1)}</p>
        </div>

        <div style={cardStyle}>
          <h3>💵 Recaudado</h3>
          <p>${totalRecaudado.toFixed(1)}</p>
        </div>

    

        <div style={cardStyle}>
          <h3>💰 Total cartera</h3>
          <p>${deudaTotal.toFixed(1)}</p>
        </div>

        <div style={cardStyle}>
          <h3>🔥 Ganancia Actual</h3>
          <p
            style={{
              color: gananciaActual >= 0 ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            ${gananciaActual.toFixed(1)}
          </p>
        </div>

        <div style={cardStyle}>
          <h3>🔥 Ganancia Total</h3>
          <p
            style={{
              color: gananciaTotal >= 0 ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            ${gananciaTotal.toFixed(1)}
          </p>
        </div>
      </div>

      {/* GRÁFICA */}
      <div style={{ width: "100%", height: 400, marginTop: "40px" }}>
        <h2>📊 Distribución real</h2>
        <ResponsiveContainer>
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